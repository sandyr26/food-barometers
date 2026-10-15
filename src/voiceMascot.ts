import mascotIdle from './assets/Mascotte1.png';
import mascotQuestion from './assets/Mascotte2.png';
import mascotSpeaking from './assets/Mascotte3.png';
import mascotListening from './assets/Mascotte4.png';
import mascotThinking from './assets/Mascotte5.png';
import mascotteBoy from './assets/mascotte-boy.png';
import type { Mascot } from './surveyConfig';

export type ConversationState = 'speaking' | 'listening' | 'recording' | 'thinking' | 'ready' | 'saving' | 'complete';

export const mascotByState: Record<Mascot, Record<ConversationState, string>> = {
  girl: { speaking: mascotSpeaking, listening: mascotListening, recording: mascotListening, thinking: mascotThinking, ready: mascotQuestion, saving: mascotThinking, complete: mascotIdle },
  boy: { speaking: mascotteBoy, listening: mascotteBoy, recording: mascotteBoy, thinking: mascotteBoy, ready: mascotteBoy, saving: mascotteBoy, complete: mascotteBoy },
};

export const conversationStateLabel: Record<ConversationState, string> = {
  speaking: 'La mascotte pose la question…',
  listening: 'Je t’écoute…',
  recording: 'Enregistrement en cours… Appuie pour terminer.',
  thinking: 'Je transcris ta réponse…',
  ready: 'Réponse enregistrée',
  saving: 'Enregistrement du questionnaire…',
  complete: 'Merci pour ta participation.',
};
