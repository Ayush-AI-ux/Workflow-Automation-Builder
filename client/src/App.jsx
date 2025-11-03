import { useState } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import { BrowserRouter,Routes, Route, Navigate} from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import WorkflowCreate from './WorkflowCreate';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path='/register' element={<Signup />}></Route>
        <Route path='/login' element={<Login />}></Route>  
        <Route path='/home' element={<Home />}></Route>     
        <Route path="/workflow-editor" element={<WorkflowCreate />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
