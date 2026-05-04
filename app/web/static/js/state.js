import { on, emit } from './events.js';

let _onboardingComplete = false;
let _currentWizardStep = 1;
let _selectedCourse = '';
let _allStudents = [];
let _currentStudentIndex = 0;
let _selectedVariant = null;
let _selectedModel = null;
let _attendanceData = { include: false, total_classes: 0, absences: 0 };
let _courseSessions = {};
let _sessionReports = [];
let _questionnaireAnswers = {};
let _currentQuestionIndex = 0;
let _currentQuestionnaire = null;
let _lastReportDownloaded = false;
let _currentQuestions = null;
let _totalQuestions = 0;
let _cachedQuestionnaires = null;
let _authState = { loggedIn: false, username: '' };
let _isNavigating = false;
let _systemStatus = { ollamaRunning: false, ollamaError: null, basePath: '', folderPath: '', folderOk: false };
let _selectedStudentIndex = -1;
let _editingQuestionnaireId = null;
let _availableModels = [];
let _currentHelpScreen = '';
let _skipOnboardingOnce = false;

export function getSelectedCourse() { return _selectedCourse; }
export function setSelectedCourse(v) {
  _selectedCourse = v;
  emit('course:selected', v);
}

export function getAllStudents() { return _allStudents; }
export function setAllStudents(v) { _allStudents = v; }

export function getCurrentStudentIndex() { return _currentStudentIndex; }
export function setCurrentStudentIndex(v) { _currentStudentIndex = v; }

export function getCurrentWizardStep() { return _currentWizardStep; }
export function setCurrentWizardStep(v) { _currentWizardStep = v; }

export function getOnboardingComplete() { return _onboardingComplete; }
export function setOnboardingComplete(v) { _onboardingComplete = v; }

export function getSelectedVariant() { return _selectedVariant; }
export function setSelectedVariant(v) { _selectedVariant = v; }

export function getSelectedModel() { return _selectedModel; }
export function setSelectedModel(v) { _selectedModel = v; }

export function getAttendanceData() { return _attendanceData; }
export function setAttendanceData(v) { _attendanceData = v; }

export function getCourseSessions() { return _courseSessions; }
export function setCourseSessions(v) { _courseSessions = v; emit('courses:changed', v); }

export function getSessionReports() { return _sessionReports; }
export function setSessionReports(v) { _sessionReports = v; emit('report:generated', v); }

export function getQuestionnaireAnswers() { return _questionnaireAnswers; }
export function setQuestionnaireAnswers(v) { _questionnaireAnswers = v; }

export function getCurrentQuestionIndex() { return _currentQuestionIndex; }
export function setCurrentQuestionIndex(v) { _currentQuestionIndex = v; }

export function getCurrentQuestionnaire() { return _currentQuestionnaire; }
export function setCurrentQuestionnaire(v) { _currentQuestionnaire = v; }

export function getLastReportDownloaded() { return _lastReportDownloaded; }
export function setLastReportDownloaded(v) { _lastReportDownloaded = v; }

export function getCurrentQuestions() { return _currentQuestions; }
export function setCurrentQuestions(v) { _currentQuestions = v; }

export function getTotalQuestions() { return _totalQuestions; }
export function setTotalQuestions(v) { _totalQuestions = v; }

export function getCachedQuestionnaires() { return _cachedQuestionnaires; }
export function setCachedQuestionnaires(v) { _cachedQuestionnaires = v; }

export function getAuthState() { return _authState; }
export function setAuthState(v) { _authState = v; emit('auth:changed', v); }

export function getIsNavigating() { return _isNavigating; }
export function setIsNavigating(v) { _isNavigating = v; }

export function getSystemStatus() { return _systemStatus; }
export function setSystemStatus(v) { _systemStatus = v; }

export function getSelectedStudentIndex() { return _selectedStudentIndex; }
export function setSelectedStudentIndex(v) { _selectedStudentIndex = v; }

export function getEditingQuestionnaireId() { return _editingQuestionnaireId; }
export function setEditingQuestionnaireId(v) { _editingQuestionnaireId = v; }

export function getAvailableModels() { return _availableModels; }
export function setAvailableModels(v) { _availableModels = v; }

export function getCurrentHelpScreen() { return _currentHelpScreen; }
export function setCurrentHelpScreen(v) { _currentHelpScreen = v; }

export function getSkipOnboardingOnce() { return _skipOnboardingOnce; }
export function setSkipOnboardingOnce(v) { _skipOnboardingOnce = v; }
