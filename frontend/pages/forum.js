import { useEffect, useState } from "react";

export default function Forum() {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answerText, setAnswerText] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAnswerText, setEditAnswerText] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access")
      : null;

  // Load questions
  const loadQuestions = async () => {
    const res = await fetch(
      "http://127.0.0.1:8000/api/forum/questions/"
    );
    const data = await res.json();
    setQuestions(data);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Post Question
  const postQuestion = async () => {

    const res = await fetch(
      "http://127.0.0.1:8000/api/forum/question/create/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      }
    );

    if (!res.ok) {
      setMessage("❌ Failed to post question");
      return;
    }

    setMessage("✅ Question posted successfully!");

    setTitle("");
    setDescription("");

    loadQuestions();
  };

  // Load answers
  const loadAnswers = async (questionId) => {

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answers/${questionId}/`
    );

    const data = await res.json();

    setAnswers((prev) => ({
      ...prev,
      [questionId]: data,
    }));
  };

  // Post answer
  const postAnswer = async (questionId) => {

    const content = answerText[questionId];

    if (!content) return;

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answer/${questionId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to post answer");
      return;
    }

    setAnswerText({
      ...answerText,
      [questionId]: "",
    });

    loadAnswers(questionId);
  };
  const deleteQuestion = async (id) => {
  const res = await fetch(
    `http://127.0.0.1:8000/api/forum/question/delete/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.ok) {
    loadQuestions();
  } else {
    alert("Failed to delete question");
  }
};
const updateQuestion = async (id) => {
  const res = await fetch(
    `http://127.0.0.1:8000/api/forum/question/update/${id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
    }
  );

  if (res.ok) {
    setEditingQuestionId(null);
    loadQuestions();
  } else {
    alert("Failed to update question");
  }
};
const deleteAnswer = async (id, questionId) => {
  const res = await fetch(
    `http://127.0.0.1:8000/api/forum/answer/delete/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.ok) {
    loadAnswers(questionId);
  } else {
    alert("Failed to delete answer");
  }
};
const updateAnswer = async (id, questionId) => {
  const res = await fetch(
    `http://127.0.0.1:8000/api/forum/answer/update/${id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: editAnswerText,
      }),
    }
  );

  if (res.ok) {
    setEditingAnswerId(null);
    loadAnswers(questionId);
  } else {
    alert("Failed to update answer");
  }
};
  return (
    <div className="page">

      {/* Navbar */}

      <div className="navbar">
        <div className="logo">ChatAI Forum</div>
      </div>

      <div className="container">

        <div className="card">

          <div className="card-header">
            Discussion Forum
          </div>

          <div className="card-body">

            {message && <p className="success">{message}</p>}

            {/* Question form */}

            <input
              placeholder="Question Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Question Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="purple-btn"
              onClick={postQuestion}
            >
              Post Question
            </button>

            <button
              className="secondary-btn"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              {showQuestions ? "Hide Questions" : "View Questions"}
            </button>

            {/* Questions list */}

            {showQuestions &&
              questions.map((q) => (

                <div key={q.id} className="question">

                  <h3>{q.title}</h3>

                  <p>{q.description}</p>

                  <small>Posted by {q.user}</small>

                  <button
                    className="view-btn"
                    onClick={() => loadAnswers(q.id)}
                  >
                    View Answers
                  </button>

                  {answers[q.id] && (
  <div className="answers">
    <h4>Answers</h4>

    {answers[q.id].map((a, i) => (
      <div key={i} className="answer-card">

        {editingAnswerId === a.id ? (
          <>
            <textarea
              value={editAnswerText}
              onChange={(e) => setEditAnswerText(e.target.value)}
            />

            <button
              onClick={() => updateAnswer(a.id, q.id)}
            >
              Save
            </button>

            <button
              onClick={() => setEditingAnswerId(null)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="answer-user">{a.user}</div>

            <div className="answer-content">{a.content}</div>

            <button
              onClick={() => {
                setEditingAnswerId(a.id);
                setEditAnswerText(a.content);
              }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteAnswer(a.id, q.id)}
            >
              Delete
            </button>
          </>
        )}

      </div>
    ))}
  </div>
)}

                  {/* Answer input */}

                  <div className="answer-box">

                    <textarea
                      placeholder="Write your answer..."
                      value={answerText[q.id] || ""}
                      onChange={(e) =>
                        setAnswerText({
                          ...answerText,
                          [q.id]: e.target.value,
                        })
                      }
                    />

                    <button
                      className="submit-answer"
                      onClick={() => postAnswer(q.id)}
                    >
                      Submit Answer
                    </button>
                    <button onClick={() => {
                          setEditingQuestionId(q.id);
                          setEditTitle(q.title);
                          setEditDescription(q.description);
                        }}>
                        Edit
                        </button>

                        <button onClick={() => deleteQuestion(q.id)}>
                        Delete
                        </button>
                        {editingQuestionId === q.id ? (
  <>
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
    />

    <textarea
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
    />

    <button onClick={() => updateQuestion(q.id)}>Save</button>
    <button onClick={() => setEditingQuestionId(null)}>Cancel</button>
  </>
) : (
  <>
    <h3>{q.title}</h3>
    <p>{q.description}</p>
  </>
)}
                  </div>

                </div>

              ))}

          </div>

        </div>

      </div>

      <style jsx>{`

      .page{
        min-height:100vh;
        background:#f3f4f6;
      }

      .navbar{
        height:64px;
        background:linear-gradient(90deg,#7c3aed,#6d28d9);
        display:flex;
        align-items:center;
        padding:0 30px;
        color:white;
        font-size:20px;
        font-weight:600;
      }

      .container{
        display:flex;
        justify-content:center;
        padding-top:60px;
      }

      .card{
        width:75%;
        max-width:900px;
        background:white;
        border-radius:12px;
        box-shadow:0 10px 30px rgba(0,0,0,0.15);
      }

      .card-header{
        background:linear-gradient(90deg,#7c3aed,#6d28d9);
        color:white;
        padding:16px;
        font-size:20px;
        font-weight:600;
        border-radius:12px 12px 0 0;
      }

      .card-body{
        padding:25px;
        display:flex;
        flex-direction:column;
        gap:12px;
      }

      input, textarea{
        padding:12px;
        border-radius:8px;
        border:1px solid #d1d5db;
      }

      textarea{
        min-height:90px;
      }

      .purple-btn{
        background:linear-gradient(90deg,#7c3aed,#6d28d9);
        border:none;
        padding:12px;
        color:white;
        border-radius:8px;
        font-weight:600;
        cursor:pointer;
      }

      .secondary-btn{
        background:#e5e7eb;
        border:none;
        padding:10px;
        border-radius:8px;
        cursor:pointer;
      }

      .question{
        margin-top:10px;
        padding:16px;
        border-radius:10px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
      }

      .view-btn{
        margin-top:10px;
        background:#e0e7ff;
        border:none;
        padding:8px 12px;
        border-radius:6px;
        cursor:pointer;
      }

      .answers{
        margin-top:10px;
        padding:10px;
        background:#f3f4f6;
        border-radius:8px;
      }

      .answer-card{
        background:white;
        padding:10px;
        border-radius:6px;
        border:1px solid #e5e7eb;
        margin-top:6px;
      }

      .answer-user{
        font-weight:600;
        color:#6366f1;
        font-size:13px;
      }

      .answer-content{
        font-size:14px;
        margin-top:3px;
      }

      .answer-box{
        margin-top:10px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      .submit-answer{
        background:linear-gradient(90deg,#6366f1,#4f46e5);
        border:none;
        padding:10px 16px;
        color:white;
        border-radius:8px;
        font-weight:600;
        cursor:pointer;
        width:160px;
      }

      .success{
        color:#16a34a;
      }

      `}</style>

    </div>
  );
}