/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';

// O APK gerado via template Android dentro do Docker usa o nome nativo "TempRN".
// Registramos o componente com esse nome para casar com o lado nativo.
AppRegistry.registerComponent('TempRN', () => App);

