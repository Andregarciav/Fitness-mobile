import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { examsAPI } from '../services/api';

type ExamType = { code: string; name: string; unit: string; reference: string };
type ExamResult = {
  id: number;
  exam_code: string;
  exam_name: string;
  value: string;
  unit: string;
  reference: string;
  exam_date: string;
  notes: string;
};

export default function ExamsScreen() {
  const [types, setTypes] = useState<ExamType[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    try {
      const [t, r] = await Promise.all([examsAPI.getTypes(), examsAPI.getAll()]);
      setTypes(t || []);
      setResults(Array.isArray(r) ? r : []);
      if (t?.length && !selectedCode) setSelectedCode(t[0].code);
    } catch {
      setError('Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedType = types.find((t) => t.code === selectedCode);

  const handleSave = async () => {
    if (!selectedType || !value.trim()) {
      setError('Preencha o exame e o valor.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await examsAPI.create({
        exam_code: selectedCode,
        exam_name: selectedType.name,
        value: value.trim(),
        unit: selectedType.unit,
        reference: selectedType.reference,
        exam_date: examDate,
        notes: notes.trim() || undefined,
      });
      setModalVisible(false);
      setValue('');
      setNotes('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Excluir este exame?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await examsAPI.delete(id);
            load();
          } catch {
            setError('Erro ao excluir.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Adicionar exame (manual)</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Meus exames</Text>
      {results.length === 0 ? (
        <Text style={styles.empty}>Nenhum exame. Toque em &quot;Adicionar exame&quot; acima.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardDate}>{item.exam_date.slice(0, 10)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardName}>{item.exam_name}</Text>
              <Text style={styles.cardValue}>
                {item.value} {item.unit}
              </Text>
              {item.reference ? <Text style={styles.cardRef}>Ref: {item.reference}</Text> : null}
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo exame</Text>

            <Text style={styles.label}>Exame</Text>
            <ScrollView style={styles.pickerWrap} nestedScrollEnabled>
              {types.map((t) => (
                <TouchableOpacity
                  key={t.code}
                  style={[styles.pickerItem, selectedCode === t.code && styles.pickerItemSelected]}
                  onPress={() => setSelectedCode(t.code)}
                >
                  <Text style={styles.pickerItemText}>{t.name}</Text>
                  <Text style={styles.pickerItemRef}>{t.reference} {t.unit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Data da coleta</Text>
            <TextInput
              style={styles.input}
              value={examDate}
              onChangeText={setExamDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Ex: 95"
              keyboardType="decimal-pad"
            />
            {selectedType?.unit ? <Text style={styles.unit}>{selectedType.unit}</Text> : null}

            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Notas" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#c33',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  empty: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteText: {
    fontSize: 12,
    color: '#c33',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  cardValue: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 2,
  },
  cardRef: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pickerWrap: {
    maxHeight: 180,
    marginBottom: 8,
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerItemSelected: {
    backgroundColor: '#e8f4ff',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#333',
  },
  pickerItemRef: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
