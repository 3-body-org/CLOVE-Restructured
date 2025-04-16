import React, { useState } from "react";
import { MyDeckContext } from "../context/MyDeckContext";
import { Modal, Button, Form } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PostAssessment = ({ show, handleClose, lesson }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [expGained, setExpGained] = useState(0);
  const [masteryAdded, setMasteryAdded] = useState(0);
  const [timeTaken, setTimeTaken] = useState("3m 25s");

  const {
    setPostAssessmentTaken,
    masteryLevels,
    setMasteryLevels,
    completedSubtopics,
  } = useContext(MyDeckContext);

  // Simulated previous mastery data
  const [masteryData, setMasteryData] = useState([
    { attempt: "Before", mastery: 40 },
    { attempt: "Now", mastery: 0 }, // Will be updated on submit
  ]);

  const questions = [
    {
      id: 1,
      text: "What is a loop?",
      options: ["Condition check", "Repeating structure", "Variable type"],
    },
    {
      id: 2,
      text: "Which loop runs at least once?",
      options: ["For Loop", "While Loop", "Do-While Loop"],
    },
  ];

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    const newMastery = 40 + 20;
    setPostAssessmentTaken(true);
    setMasteryLevels((prev) => ({
      ...prev,
      [lesson]: newMastery,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{lesson} - Post-Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!submitted ? (
          <>
            <Form>
              {questions.map((q) => (
                <Form.Group key={q.id} className="mb-3">
                  <Form.Label>{q.text}</Form.Label>
                  {q.options.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      name={`question-${q.id}`}
                      label={option}
                      onChange={() => handleAnswerChange(q.id, option)}
                    />
                  ))}
                </Form.Group>
              ))}
            </Form>
            <Button
              className="w-100 mt-3"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Submit
            </Button>
          </>
        ) : (
          <>
            <h5 className="text-center">🎉 Post-Assessment Complete! 🎉</h5>
            <p>
              <strong>EXP Gained:</strong> {expGained} XP
            </p>
            <p>
              <strong>Mastery Added:</strong> {masteryAdded}%
            </p>
            <p>
              <strong>Time Taken:</strong> {timeTaken}
            </p>

            {/* Mastery Line Chart */}
            <h6 className="mt-3">📈 Mastery Progress</h6>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={masteryData}>
                <XAxis dataKey="attempt" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mastery"
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

            <Button
              className="w-100 mt-3"
              variant="success"
              onClick={handleClose}
            >
              Finish
            </Button>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PostAssessment;
