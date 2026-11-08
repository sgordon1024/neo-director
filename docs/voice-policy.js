// No network fallback. These checks do not themselves open a microphone.
export function localVoice(voices){return voices.find(v=>v.localService===true && /^en(?:[-_]|$)/i.test(v.lang))||null;}
export async function prepareRecognition(Constructor){
 if(typeof Constructor!=='function'||typeof Constructor.available!=='function')throw Error('This browser cannot verify offline speech recognition. Please type your request.');
 const recognition=new Constructor();
 if(!('processLocally' in recognition))throw Error('Local-only speech is unavailable. Please type your request.');
 recognition.processLocally=true;
 if(recognition.processLocally!==true)throw Error('Local-only recognition could not be enforced.');
 const available=await Constructor.available({langs:['en-US'],processLocally:true});
 if(available!=='available')throw Error('An installed offline English speech pack is unavailable. Please type your request. No download or cloud fallback was attempted.');
 recognition.lang='en-US';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
 return recognition;
}
export function reviewedSpeech(text){if(typeof text!=='string'||!text.trim()||text.length>500)throw Error('Speech was empty or too long. Please type a short supported request.');return text.trim();}
