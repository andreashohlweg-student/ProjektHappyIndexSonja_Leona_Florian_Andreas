// Vorbereitete Anwendungsschicht. Repository-Funktionen können einzeln ersetzt werden.
export {getYears,getCountries} from '../repositories/catalog.repository.js';
export {getRankings} from '../repositories/rankings.repository.js';
export {getHistory} from '../repositories/history.repository.js';
export {getComparison} from '../repositories/comparison.repository.js';
export {getTrends} from '../repositories/trends.repository.js';
