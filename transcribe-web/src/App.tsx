import React, { useState } from 'react';
import axios from 'axios';
import { ref, push, set, onValue } from "firebase/database";
import { database } from '../firebaseConfig';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const db = database;
  const transcriptionRef = ref(db, 'transcriptions');

  React.useEffect(() => {
    onValue(transcriptionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transcriptions = Object.entries(data).map(([key, value]: any) => {
          return { id: key, ...value };
        });
        console.log("Transcriptions: ", transcriptions);
        setTranscriptions(transcriptions);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload a file first");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Send audio file directly to Whisper API
      const response = await axios.post('http://localhost:3000/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const conversation = response.data.transcription.split(/;|\n/);

      // Save transcription to Firebase
      const newTranscriptionRef = push(transcriptionRef);
      set(newTranscriptionRef, {
        conversation
      });

      setTranscription(response.data.transcription);
    } catch (error: any) {
      console.error("Error transcribing file: ", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex p-4 min-w-screen">
      <div className='flex flex-col w-1/3'>
        <p className="text-2xl font-bold mb-4">Audio Transcription App</p>
        <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-4 p-2 bg-gray-500 rounded-xl" />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Transcribe"}
        </button>
        <div className='mt-4'>
          <p className="text-2xl font-bold">Transcriptions:</p>
          <ul className='mt-4'>
            {transcriptions.map((transcription, index) => (
              <li key={index} className='mb-4'>
                <button
                  onClick={() => setTranscription(transcription.conversation.join('\n'))}
                  className="bg-gray-500 text-white px-2 py-1 rounded-lg hover:bg-gray-600"
                >
                  {transcription.id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='flex flex-col w-2/3 pl-8'>
        <div className='flex justify-between pr-4'>
          <p className="text-2xl font-bold">Transcription:</p>
          <button
            onClick={() => setTranscription('')}
            className="bg-red-500 text-white px-2 rounded-lg hover:bg-red-600"
          >
            Clear
          </button>
        </div>

        <div className='flex flex-col w-full max-h-screen overflow-y-auto'>
          {transcription && transcription.split(/;|\n/).map((line, index) => {
            if (index % 2 === 0) {
              return <div className='flex w-full justify-start'><div key={index} className="mb-2 font-semibold w-1/2 bg-white text-black p-4 rounded-xl">{line}</div></div>;
            }
            return <div className='flex w-full justify-end'><div key={index} className="mb-2 font-semibold w-1/2 bg-black text-white p-4 rounded-xl">{line}</div></div>;
          })}
        </div>
      </div>

    </div>
  );
};

export default App;
