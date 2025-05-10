import React, { useState, useEffect } from 'react';

// Define the structure for a single quiz/mystery question
interface QuizQuestion {
  id: number;
  locationId: number; // The ID of the point where this question is asked
  question: string;
  answer: string;
  difficulty: 'elementary' | 'junior_high' | 'high_school';
  nextHint?: string; // Hint for the next location (optional for the last question in a sequence)
}

// Define the structure for a quiz point (only location information needed now)
interface QuizPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

// Define the structure for all quiz data, grouped by difficulty
interface QuizData {
  elementary: QuizQuestion[];
  junior_high: QuizQuestion[];
  high_school: QuizQuestion[];
}

// Define the structure for user's location
interface UserLocation {
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two points on the Earth (in meters)
const haversineDistance = (coords1: UserLocation, coords2: { latitude: number; longitude: number }): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

// Define your quiz points in Nishishiratakedai, Ikoma City (Location data only)
const locations: QuizPoint[] = [
  {
    id: 1,
    name: 'やまのたに公園',
    latitude: 34.7308202,
    longitude: 135.7047669,
  },
  {
    id: 2,
    name: 'ファミリーマート西白庭台店',
    latitude: 34.7308202,
    longitude: 135.7047669,
  },
  {
    id: 3,
    name: '白谷公園',
    latitude: 34.725866,
    longitude: 135.7044922,
  },
    {
    id: 4,
    name: '中山公園',
    latitude: 34.727794,
    longitude: 135.7051538,
  },
];

// Define all quiz questions, grouped by difficulty
const allQuizzes: QuizData = {
  elementary: [
    {
      id: 101,
      locationId: 1, // やまのたに公園
      question: '【小学生向け謎解き】やまのたに公園にある、一番高い遊具は何かな？その遊具の色をひらがなで答えてね。',
      answer: 'あか',
      difficulty: 'elementary',
      nextHint: '次の場所は、みんながお腹が空いた時に立ち寄るお店だよ。緑と白の看板が目印！',
    },
    {
      id: 201,
      locationId: 2, // ファミリーマート西白庭台店
      question: '【小学生向け謎解き】ファミリーマート西白庭台店で売っているもので、温かい飲み物が入っている機械は何かな？カタカナで答えてね。',
      answer: 'コーヒーメーカー',
      difficulty: 'elementary',
      nextHint: '次は、広場で思いっきり遊べる、もう一つの公園に行ってみよう！',
    },
    {
      id: 301,
      locationId: 3, // 白谷公園
      question: '【小学生向け謎解き】白谷公園にある、くるくる回って遊ぶ遊具の名前は何かな？ひらがなで答えてね。',
      answer: 'コーヒーカップ', // 例：遊具の名前
      difficulty: 'elementary',
      nextHint: '最後は、ちょっと離れた場所にある、静かな公園だよ。',
    },
    {
      id: 401,
      locationId: 4, // 中山公園 (Goal)
      question: '【小学生向け謎解き】中山公園の地面に描かれている、線をたどって遊ぶものは何かな？カタカナで答えてね。',
      answer: 'ケンケンパ', // 例：地面の遊び
      difficulty: 'elementary',
      // No next hint for the final point
    },
  ],
  junior_high: [
    {
      id: 102,
      locationId: 1, // やまのたに公園
      question: '【中学生向け謎解き】やまのたに公園の名前の由来には、この地域の古い地名が関係しています。その地名は何でしょう？漢字で答えてください。',
      answer: '白庭台',
      difficulty: 'junior_high',
      nextHint: '次の場所は、ちょっと休憩したいときに便利な、あのコンビニエンスストアです。',
    },
    {
      id: 202,
      locationId: 2, // ファミリーマート西白庭台店
      question: '【中学生向け謎解き】ファミリーマート西白庭台店の看板に使われている色は、緑、白、そしてもう一つは何色でしょう？漢字一文字で答えてください。',
      answer: '青',
      difficulty: 'junior_high',
      nextHint: '次は、ボール遊びもできる、広々とした公園を目指してください。',
    },
    {
      id: 302,
      locationId: 3, // 白谷公園
      question: '【中学生向け謎解き】白谷公園には、季節ごとに様々な花が咲きます。春に特に美しい、ピンク色の小さな花をつける木は何でしょう？漢字で答えてください。',
      answer: '桜',
      difficulty: 'junior_high',
      nextHint: '最後は、落ち着いた雰囲気の公園です。',
    },
    {
      id: 402,
      locationId: 4, // 中山公園 (Goal)
      question: '【中学生向け謎解き】中山公園の名前の「第三」は、この地域の開発順序を示しています。では、「第一」公園よりも後に開発された、この公園の特徴的な施設は何でしょう？漢字で答えてください。',
      answer: '展望台', // 例：特徴的な施設
      difficulty: 'junior_high',
      // No next hint for the final point
    },
  ],
  high_school: [
    {
      id: 103,
      locationId: 1, // やまのたに公園
      question: '【高校生向け謎解き】やまのたに公園の設計には、地域の自然景観との調和が考慮されています。特に意識された、この地域に多く見られる樹木の種類は何でしょう？カタカナで答えてください。',
      answer: 'マツ',
      difficulty: 'high_school',
      nextHint: '次の場所は、飲み物やお菓子、日用品まで揃う、みんなの味方です。',
    },
    {
      id: 203,
      locationId: 2, // ファミリーマート西白庭台店
      question: '【高校生向け謎解き】ファミリーマート西白庭台店が提供しているサービスの一つに、公共料金の支払いがあります。このサービスを利用する際に必要な、お店の端末の名前は何でしょう？カタカナで答えてください。',
      answer: 'Famiポート',
      difficulty: 'high_school',
      nextHint: '次は、地域の憩いの場となっている、別の公園です。',
    },
    {
      id: 303,
      locationId: 3, // 白谷公園
      question: '【高校生向け謎解き】白谷公園の近くには、この地域の歴史を示す古い石碑があります。その石碑に刻まれている元号は何でしょう？漢字で答えてください。',
      answer: '明治', // 例：石碑の元号
      difficulty: 'high_school',
      nextHint: '最後は、このゲームのゴール地点となる公園です。',
    },
    {
      id: 403,
      locationId: 4, // 中山公園 (Goal)
      question: '【高校生向け謎解き】中山公園から見える生駒山の景色は、古くから多くの歌に詠まれてきました。万葉集に収められている歌の中で、生駒山を詠んだ歌の作者として有名な人物は誰でしょう？ひらがなで答えてください。',
      answer: 'やまのうえのおくら', // 例：万葉集の歌人
      difficulty: 'high_school',
      // No next hint for the final point
    },
  ],
};


// Define the proximity radius in meters
const PROXIMITY_RADIUS = 50; // 50 meters

// Local Storage Keys
const ANSWERED_QUESTION_IDS_STORAGE_KEY = 'locationQuizAnsweredQuestionIds';
const DIFFICULTY_STORAGE_KEY = 'locationQuizDifficulty';

const LocationQuiz: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyLocation, setNearbyLocation] = useState<QuizPoint | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<number[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<'elementary' | 'junior_high' | 'high_school' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizQuestion[]>([]);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false); // New state for game completion


  // Load state from Local Storage on component mount
  useEffect(() => {
    const savedAnsweredQuestionIds = localStorage.getItem(ANSWERED_QUESTION_IDS_STORAGE_KEY);
    const loadedAnsweredIds = savedAnsweredQuestionIds ? JSON.parse(savedAnsweredQuestionIds) : [];
    setAnsweredQuestionIds(loadedAnsweredIds);

    const savedDifficulty = localStorage.getItem(DIFFICULTY_STORAGE_KEY) as 'elementary' | 'junior_high' | 'high_school' | null;
    if (savedDifficulty) {
      setDifficultyLevel(savedDifficulty);
      // Check if game was already completed based on loaded state
      const quizzesForDifficulty = allQuizzes[savedDifficulty];
      const allAnswered = quizzesForDifficulty.every(q => loadedAnsweredIds.includes(q.id));
      if (allAnswered) {
          setIsGameCompleted(true);
          setHint('ゲームクリアです！おめでとうございます！'); // Set final hint if already completed
      }
    }

  }, []); // Empty dependency array means this runs only once on mount

  // Save state to Local Storage whenever answeredQuestionIds or difficultyLevel changes
  useEffect(() => {
    localStorage.setItem(ANSWERED_QUESTION_IDS_STORAGE_KEY, JSON.stringify(answeredQuestionIds));
  }, [answeredQuestionIds]);

  useEffect(() => {
     if (difficultyLevel) {
        localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficultyLevel);
     } else {
        localStorage.removeItem(DIFFICULTY_STORAGE_KEY);
     }
  }, [difficultyLevel]);

  // Update available quizzes when difficulty changes or questions are answered
  useEffect(() => {
      if (difficultyLevel) {
          const quizzesForDifficulty = allQuizzes[difficultyLevel];
          // Filter out questions that have already been answered
          const unansweredQuizzes = quizzesForDifficulty.filter(q => !answeredQuestionIds.includes(q.id));
          setAvailableQuizzes(unansweredQuizzes);

          // If all quizzes for the current difficulty are now answered, mark game as completed
          if (unansweredQuizzes.length === 0 && !isGameCompleted) {
              setIsGameCompleted(true);
              setHint('すべてのポイントをクリアしました！ゲームクリアです！');
          }

      } else {
          setAvailableQuizzes([]);
      }
  }, [difficultyLevel, answeredQuestionIds, isGameCompleted]); // Added isGameCompleted dependency


  // Effect to get and watch user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setFeedback('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        setFeedback(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Effect to check for nearby quiz locations whenever the user's location or availableQuizzes changes
  useEffect(() => {
    if (userLocation && availableQuizzes.length > 0 && !isGameCompleted) { // Added !isGameCompleted condition
      let foundNearbyLocation: QuizPoint | null = null;
      let questionAtLocation: QuizQuestion | null = null;

      for (const quiz of availableQuizzes) {
        const location = locations.find(loc => loc.id === quiz.locationId);
        if (location) {
          const distance = haversineDistance(userLocation, location);
          if (distance <= PROXIMITY_RADIUS) {
            foundNearbyLocation = location;
            questionAtLocation = quiz;
            break; // Found a nearby location with an available quiz
          }
        }
      }
      setNearbyLocation(foundNearbyLocation);
      setCurrentQuestion(questionAtLocation);

      // If no longer near a relevant location, hide the quiz and clear feedback/hint
      if (!foundNearbyLocation) {
        setQuizActive(false);
        setFeedback('');
        setUserAnswer('');
        // Don't clear hint here, as the hint might guide to the next location
      }
    } else if (userLocation && availableQuizzes.length === 0 && difficultyLevel && !isGameCompleted) {
        // This case should now be handled by the availableQuizzes useEffect,
        // but we keep it for robustness. It will set isGameCompleted.
         setNearbyLocation(null);
         setQuizActive(false);
         setUserAnswer('');
         setCurrentQuestion(null);
         // Hint and feedback will be set by the availableQuizzes useEffect
    }
     else if (userLocation && !difficultyLevel) {
        // If location is available but difficulty is not selected, clear nearby location
        setNearbyLocation(null);
        setQuizActive(false);
        setFeedback('');
        setUserAnswer('');
        setCurrentQuestion(null);
        setHint(null);
    }
  }, [userLocation, availableQuizzes, difficultyLevel, isGameCompleted]); // Added isGameCompleted dependency

  // Handle difficulty selection
  const handleDifficultySelect = (difficulty: 'elementary' | 'junior_high' | 'high_school') => {
    setDifficultyLevel(difficulty);
    // When difficulty changes, check if already completed for this difficulty
    const quizzesForDifficulty = allQuizzes[difficulty];
    const allAnswered = quizzesForDifficulty.every(q => answeredQuestionIds.includes(q.id));
    setIsGameCompleted(allAnswered); // Set completion state based on loaded data

    if (allAnswered) {
         setHint('ゲームクリアです！おめでとうございます！');
    } else {
        setHint(null); // Clear hint if not completed for this difficulty
    }
    setFeedback(''); // Clear feedback
    setQuizActive(false); // Hide quiz UI
    setNearbyLocation(null); // Clear nearby location UI
    setCurrentQuestion(null); // Clear current question
    setUserAnswer(''); // Clear answer
  };


  // Handle the "Start Quiz" button click
  const handleStartQuiz = () => {
    if (nearbyLocation && currentQuestion) {
      setQuizActive(true);
      setFeedback('');
      setUserAnswer('');
      setHint(null); // Clear previous hint when starting a new quiz
    }
  };

  // Handle the answer submission
  const handleSubmitAnswer = () => {
    if (nearbyLocation && currentQuestion) {
      if (userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
        setFeedback('正解です！');
        const newAnsweredQuestionIds = [...answeredQuestionIds, currentQuestion.id];
        setAnsweredQuestionIds(newAnsweredQuestionIds); // Mark this specific question as answered
        setQuizActive(false); // Hide the quiz after answering
        setUserAnswer(''); // Clear the answer input

        // Find the next quiz in the sequence for the current difficulty
        const quizzesForDifficulty = allQuizzes[difficultyLevel!];
         // Sort quizzes by ID to ensure a consistent sequence for hints
        quizzesForDifficulty.sort((a, b) => a.id - b.id);

        const currentIndex = quizzesForDifficulty.findIndex(q => q.id === currentQuestion.id);
        const nextQuiz = quizzesForDifficulty[currentIndex + 1];

        if (nextQuiz && nextQuiz.nextHint) {
            setHint(nextQuiz.nextHint);
            setIsGameCompleted(false); // Ensure game is not marked completed if there's a next hint
        } else {
             // This is the last question for this difficulty
             setHint('すべてのポイントをクリアしました！ゲームクリアです！');
             setIsGameCompleted(true); // Mark game as completed
        }
        setNearbyLocation(null); // Clear the nearby location UI after answering


      } else {
        setFeedback('不正解です。もう一度試してください。');
      }
    }
  };

    // Function to get the name of a location by its ID
    const getLocationNameById = (locationId: number): string => {
        const location = locations.find(loc => loc.id === locationId);
        return location ? location.name : '不明な場所';
    };

    // Function to reset the game
    const resetGame = () => {
        localStorage.clear(); // Clear all local storage for the game
        window.location.reload(); // Reload the page to reset state
    };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">生駒市西白庭台 謎解き位置情報ゲーム</h1>

      {!userLocation && <p>位置情報を取得中です...</p>}

      {userLocation && (
        <div>
          <p>
            現在地：緯度 {userLocation.latitude.toFixed(6)}, 経度 {userLocation.longitude.toFixed(6)}
          </p>

          {!difficultyLevel ? (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">難易度を選択してください</h2>
              <button
                onClick={() => handleDifficultySelect('elementary')}
                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                小学生
              </button>
              <button
                onClick={() => handleDifficultySelect('junior_high')}
                className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                中学生
              </button>
              <button
                onClick={() => handleDifficultySelect('high_school')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                高校生
              </button>
            </div>
          ) : (
             <p className="mt-2 text-lg">選択中の難易度: <span className="font-semibold">
                {difficultyLevel === 'elementary' ? '小学生' : difficultyLevel === 'junior_high' ? '中学生' : '高校生'}
                </span>
             </p>
          )}


          {hint && !isGameCompleted && ( // Display hint only if game is not completed
            <div className="mt-4 p-4 border rounded shadow bg-yellow-100 text-yellow-800">
              <h3 className="text-lg font-semibold">次の場所へのヒント:</h3>
              <p>{hint}</p>
            </div>
          )}

            {/* Game Clear Message - Display only if isGameCompleted is true */}
            {isGameCompleted && hint && ( // Use hint state for the final message
                 <div className="mt-4 p-4 border rounded shadow bg-green-100 text-green-800">
                    <h3 className="text-lg font-semibold">ゲームクリア！</h3>
                    <p>{hint}</p>
                    {/* Add a reset button */}
                    <button
                       onClick={resetGame}
                       className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                       ゲームをリセットする
                    </button>
                 </div>
            )}


          {/* Show "Start Quiz" button or Quiz UI if near a location with an available quiz and game is not completed */}
          {nearbyLocation && currentQuestion && !isGameCompleted ? (
             !quizActive ? (
                // Show "Start Quiz" button
                <div className="mt-4 p-4 border rounded shadow bg-blue-100">
                   <p className="text-lg font-semibold">{nearbyLocation.name} が近くにあります！</p>
                   <button
                     onClick={handleStartQuiz}
                     className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                   >
                     謎解きを開始する
                   </button>
                </div>
             ) : (
                // Show the quiz
                <div className="mt-4 p-4 border rounded shadow bg-blue-100">
                    <p className="text-lg font-semibold">{nearbyLocation.name} での謎解き:</p>
                    <div className="mt-4">
                     <p className="mb-2 font-semibold">{currentQuestion.question}</p>
                     <input
                       type="text"
                       value={userAnswer}
                       onChange={(e) => setUserAnswer(e.target.value)}
                       className="border rounded px-2 py-1 mr-2 text-gray-800"
                       placeholder="回答を入力"
                     />
                     <button
                       onClick={handleSubmitAnswer}
                       className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                     >
                       回答する
                     </button>
                     {feedback && <p className={`mt-2 ${feedback.includes('正解') ? 'text-green-700' : 'text-red-700'}`}>{feedback}</p>}
                   </div>
                </div>
             )
          ) : (
            // Show message when no relevant point is nearby and not game over
            userLocation && difficultyLevel && !isGameCompleted && // Add !isGameCompleted condition
            // Check if there are any un-answered quizzes for the selected difficulty
            allQuizzes[difficultyLevel].some(q => !answeredQuestionIds.includes(q.id)) &&
            !hint && ( // Don't show this message if a hint is already displayed
                 <p className="mt-4">近くに、選択した難易度で未回答のクイズポイントはありません。ヒントを参考に次の場所を探しましょう！</p>
            )
          )}


          {difficultyLevel && (answeredQuestionIds.length > 0) && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">クリアした謎解き ({difficultyLevel === 'elementary' ? '小学生' : difficultyLevel === 'junior_high' ? '中学生' : '高校生'})</h2>
              <ul>
                {answeredQuestionIds.map(questionId => {
                    // Find the question by ID to get its details across all difficulties
                    let answeredQuestion: QuizQuestion | undefined;
                    for (const diff in allQuizzes) {
                         answeredQuestion = allQuizzes[diff as keyof QuizData].find(q => q.id === questionId);
                         if (answeredQuestion) break;
                    }

                    return answeredQuestion && answeredQuestion.difficulty === difficultyLevel ? (
                         <li key={answeredQuestion.id}>
                            {getLocationNameById(answeredQuestion.locationId)} - クリア！
                         </li>
                    ) : null;
                })}
              </ul>
            </div>
          )}

        </div>
      )}

      {feedback && !userLocation && <p className="mt-4 text-red-500">{feedback}</p>}
    </div>
  );
};

export default LocationQuiz;
