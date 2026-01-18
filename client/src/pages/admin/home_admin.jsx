

import React from 'react'
import Navbar from '../../comp/navbar.jsx';
import QuestionForm from './QuestionForm.jsx';
import Organiz_admin from './organiz_admin.jsx';
import { Link } from 'react-router-dom';
export default function Home_admin() {
  return (
    <>
      <Navbar />
      <br />
      <br />
      <br />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/admin2">
          <button style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}>
            Go to Admin 2
          </button>
        </Link>
        <Link to="/admin-panel">
          <button style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}>
            Go to Admin Panel (New)
          </button>
        </Link>
      </div>
      <QuestionForm />
      <Organiz_admin />

      <div>

      </div>


    </>


  )
}
