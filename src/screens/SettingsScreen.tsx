import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { userAPI, healthAPI } from '../services/api';

const MAX_SIZE_BYTES = 500 * 1024; // 500 KB

export default function SettingsScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhotoBase64(user.photo_base64 ?? '');
    }
  }, [user]);

  const pickImage = () => {
    setError('');
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          setError(response.errorMessage || 'Erro ao abrir a galeria.');
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.base64) {
          setError('Não foi possível obter a imagem.');
          return;
        }
        const mime = asset.type || 'image/jpeg';
        const dataUrl = `data:${mime};base64,${asset.base64}`;
        if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
          setError('Imagem muito grande. Use uma foto de até 500 KB.');
          return;
        }
        setPhotoBase64(dataUrl);
      }
    );
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      await userAPI.updateMe({
        name: name.trim(),
        photo_base64: photoBase64 || undefined,
      });
      await refreshUser();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao atualizar perfil.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const photoPreview = photoBase64 || user?.photo_base64;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {photoPreview ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photoPreview }} style={styles.avatar} />
            <TouchableOpacity onPress={() => setPhotoBase64('')} style={styles.removePhoto}>
              <Text style={styles.removePhotoText}>Remover foto</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Foto de perfil</Text>
        <TouchableOpacity style={styles.selectPhotoButton} onPress={pickImage}>
          <Text style={styles.selectPhotoText}>
            {photoPreview ? 'Trocar foto' : 'Selecionar da galeria'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hint}>A foto é salva no banco. Máx. 500 KB.</Text>

        <Text style={styles.sectionTitle}>Conexões de saúde</Text>
        <Text style={styles.hint}>
          Conecte Samsung Health pelo app. Os dados sincronizados aparecem na web. Toque em "Sincronizar" para
          enviar dados ao servidor (quando houver integração com Health Connect, os dados reais serão enviados).
        </Text>
        <TouchableOpacity
          style={[styles.syncButton, syncLoading && styles.buttonDisabled]}
          onPress={async () => {
            setSyncMessage('');
            setSyncLoading(true);
            try {
              const today = new Date().toISOString().slice(0, 10);
              const res = await healthAPI.sync('samsung_health', [
                { category: 'steps', type: 'daily', value: '0', unit: 'steps', date: today + 'T12:00:00Z' },
              ]);
              setSyncMessage(`Sincronizado: ${(res as any).synced ?? 0} métrica(s).`);
            } catch (e: any) {
              setSyncMessage(e.response?.data?.error || 'Erro ao sincronizar.');
            } finally {
              setSyncLoading(false);
            }
          }}
          disabled={syncLoading}
        >
          {syncLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sincronizar dados de saúde</Text>
          )}
        </TouchableOpacity>
        {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  photoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0e0e0',
  },
  removePhoto: {
    marginTop: 8,
  },
  removePhotoText: {
    fontSize: 14,
    color: '#c33',
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  selectPhotoButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  selectPhotoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#c33',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  syncMessage: {
    fontSize: 13,
    color: '#333',
    marginBottom: 16,
  },
});
