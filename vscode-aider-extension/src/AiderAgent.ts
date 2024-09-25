import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the type for the assistant configuration
interface Assistant {
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  model: {
    messages: Array<{
      role: string;
      content: string;
    }>;
    provider: string;
    model: string;
    temperature: number;
    semanticCachingEnabled: boolean;
    maxTokens: number;
  };
  voice: {
    provider: string;
    voiceId: string;
    model: string;
  };
  recordingEnabled: boolean;
  endCallFunctionEnabled: boolean;
  silenceTimeoutSeconds: number;
}

// Define the type for the button configuration
interface ButtonConfig {
  position: string;
  offset: string;
  width: string;
  height: string;
  idle: ButtonState;
  loading: ButtonState;
  active: ButtonState;
}

// Define the type for each button state
interface ButtonState {
  color: string;
  type: string;
  title: string;
  subtitle: string;
  icon: string;
}

// Initialize the Vapi instance
let vapiInstance: any = null;

// Get API key from environment variables
const apiKey: string = process.env.VAPI_API_KEY || '';

if (!apiKey) {
  console.error('API key not found. Please set VAPI_API_KEY in your .env file.');
  process.exit(1);
}

// Assistant configuration
const assistant: Assistant = {
  transcriber: {
    provider: process.env.TRANSCRIBER_PROVIDER || 'deepgram',
    model: process.env.TRANSCRIBER_MODEL || 'nova-2',
    language: process.env.TRANSCRIBER_LANGUAGE || 'en',
  },
  model: {
    messages: [
      {
        role: 'assistant',
        content: 'gpt-4',
      },
    ],
    provider: process.env.MODEL_PROVIDER || 'openai',
    model: process.env.MODEL_NAME || 'gpt-4',
    temperature: parseFloat(process.env.MODEL_TEMPERATURE || '0.5'),
    semanticCachingEnabled: process.env.SEMANTIC_CACHING_ENABLED === 'true',
    maxTokens: parseInt(process.env.MAX_TOKENS || '600', 10),
  },
  voice: {
    provider: process.env.VOICE_PROVIDER || '11labs',
    voiceId: process.env.VOICE_ID || 'Qo58kPMIOmtZygIVLQfp',
    model: process.env.VOICE_MODEL || 'eleven_turbo_v2',
  },
  recordingEnabled: process.env.RECORDING_ENABLED === 'true',
  endCallFunctionEnabled: process.env.END_CALL_FUNCTION_ENABLED === 'true',
  silenceTimeoutSeconds: parseInt(process.env.SILENCE_TIMEOUT_SECONDS || '10', 10),
};

// Determine whether to use GET or POST request
const useGetRequest: boolean = process.env.USE_GET_REQUEST === 'true';

// Options for the API request
const options: RequestInit = {
  method: useGetRequest ? 'GET' : 'POST',
  headers: {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  },
};

// If using POST, add the body to the options
if (!useGetRequest) {
  options.body = JSON.stringify(assistant);
}

// Construct the URL for the API request
let url = 'https://api.vapi.ai/assistant';
if (useGetRequest) {
  const params = new URLSearchParams(assistant as any);
  url += '?' + params.toString();
}

// Make the API request to create the assistant
fetch(url, options)
  .then(response => response.json())
  .then(response => {
    console.log(response);
    // Start the call with the assistant here
  })
  .catch(err => console.error(err));

// Button configuration
const buttonConfig: ButtonConfig = {
  position: process.env.BUTTON_POSITION || 'top',
  offset: process.env.BUTTON_OFFSET || '360px',
  width: process.env.BUTTON_WIDTH || '60px',
  height: process.env.BUTTON_HEIGHT || '50px',
  idle: {
    color: process.env.BUTTON_IDLE_COLOR || 'rgb(93, 254, 202)',
    type: process.env.BUTTON_TYPE || 'pill',
    title: process.env.BUTTON_IDLE_TITLE || 'Have a quick question?',
    subtitle: process.env.BUTTON_IDLE_SUBTITLE || 'Talk to AI assistant',
    icon: process.env.BUTTON_IDLE_ICON || `https://unpkg.com/lucide-static@0.321.0/icons/phone.svg`,
  },
  loading: {
    color: process.env.BUTTON_LOADING_COLOR || 'rgb(93, 124, 202)',
    type: process.env.BUTTON_TYPE || 'pill',
    title: process.env.BUTTON_LOADING_TITLE || 'Connecting...',
    subtitle: process.env.BUTTON_LOADING_SUBTITLE || 'Please wait',
    icon: process.env.BUTTON_LOADING_ICON || `https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg`,
  },
  active: {
    color: process.env.BUTTON_ACTIVE_COLOR || 'rgb(255, 0, 0)',
    type: process.env.BUTTON_TYPE || 'pill',
    title: process.env.BUTTON_ACTIVE_TITLE || 'Call is in progress...',
    subtitle: process.env.BUTTON_ACTIVE_SUBTITLE || 'End the call',
    icon: process.env.BUTTON_ACTIVE_ICON || `https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg`,
  },
};

// Function to dynamically load the Vapi SDK script
(function (d: Document, t: string) {
  const g = document.createElement(t);
  g.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
  g.defer = true;
  g.async = true;
  document.getElementsByTagName(t)[0].parentNode!.insertBefore(g, document.getElementsByTagName(t)[0]);

  g.onload = function () {
    (window as any).vapiSDK.run({
      apiKey,
      assistant,
      config: buttonConfig,
    }).then((vapi: any) => {
      vapiInstance = vapi;
      // Add functionality to Vapi Instance here
    }).catch((error: Error) => {
      console.error('Error initializing Vapi SDK:', error);
    });
  };
})(document, 'script');

// Example of how to use the Vapi instance
function startCall() {
  if (vapiInstance) {
    vapiInstance.startCall();
  } else {
    console.error('Vapi instance not initialized');
  }
}

function endCall() {
  if (vapiInstance) {
    vapiInstance.endCall();
  } else {
    console.error('Vapi instance not initialized');
  }
}

// Export functions if needed
export { startCall, endCall };