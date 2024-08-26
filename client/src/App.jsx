import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Heading, Center, VStack, Box } from '@chakra-ui/react';
import StudentAuth from './components/studentAuth';
import ClassroomModel from './components/classroomModel';
import Navbar from './components/Navbar';
import TeacherAuth from './components/teacherAuth';
import Footer from './components/Footer';
import PaperCorrection from './components/PaperCorrection';
function App() {
  return (
    <Router>
      <Navbar />
      <Box px={8} py={4}>
        <Routes>
          <Route path="/student" element={<StudentAuth />} />
          <Route path="/teacher" element={<TeacherAuth />} />
          <Route path='/paper-corrector' element={<PaperCorrection/>} />
          <Route path="/" element={<ClassroomModel />}/>
        </Routes>
      </Box>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
