// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // Changed to 'Home' with a capital H for convention
import WelcomeModal from "./comp/WelcomeModal"; // Import the new modal component
import Login from "./comp/login"; // Import the new modal component
import SignUp from "./comp/SignUp"; // Import the new modal component
import Courses from "./pages/cours.jsx"; // Import the new modal component
import Examen from "./pages/examen.jsx"; // Import the new modal component
import Cours_question from "./pages/cours_question.jsx"; // Import the new modal component
import CoursSeries from "./pages/cours_series.jsx"; // ⭐️ New Component
import Examen_question from "./pages/examen_question.jsx"; // Import the new modal component
import ExamenSeries from './pages/examen_series'; // ⭐️ New Component
import Contact from "./pages/contact.jsx"; // Import the new modal component
import Subscriptions from "./pages/subscriptions.jsx"; // Import the new modal component
import Serie from "./pages/serie.jsx"; // Import the new modal component
import Examen_test from "./pages/examen_test.jsx"; // Import the new modal component
import Home_admin from "./pages/admin/home_admin.jsx"; // Import the new modal component

const MODAL_CLOSED_KEY = "welcomeModalClosed";

const App = () => {
  // State to control the visibility of the modal
  const [showModal, setShowModal] = useState(false);

  // useEffect hook runs after the component mounts
  useEffect(() => {
    // 1. Check if the user has closed the modal before
    const hasClosed = localStorage.getItem(MODAL_CLOSED_KEY);

    // 2. If it hasn't been closed, show the modal
    if (hasClosed !== "true") {
      setShowModal(true);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle modal closure
  const handleModalClose = () => {
    // 1. Close the modal in the current session
    setShowModal(false);

    // 2. Record the closure in localStorage so it won't appear on the next visit
    localStorage.setItem(MODAL_CLOSED_KEY, "true");
  };

  return (
    <div>
      {/* Conditionally render the WelcomeModal */}
      {showModal && <WelcomeModal onClose={handleModalClose} />}

      {/* Your main routing structure */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/examens" element={<Examen />} />
          <Route path="/cours/question" element={<Cours_question />} />
          <Route path="/cours/series" element={<CoursSeries />} /> {/* ⭐️ New Route */}
          <Route path="/Cours_question" element={<Cours_question />} /> {/* ⭐️ Legacy Support */}
          <Route path="/examen/question" element={<Examen_question />} />
          <Route path="/examen_question" element={<Examen_question />} /> {/* ⭐️ Legacy Support */}
          <Route path="/examen/series" element={<ExamenSeries />} /> {/* ⭐️ New Route */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/serie" element={<Serie />} />
          <Route path="/Examen" element={<Examen_test />} />
          <Route path="/admin" element={<Home_admin />} />

          {/* Catch-all route for any other path */}
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;