import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import styled from "styled-components";
import { useState } from "react";
import { Route, Routes } from 'react-router-dom';

import Device from "./pages/device";
import Tag from "./pages/tag";
import Protocol from "./pages/protocol";
import Config from "./pages/config";
import MQTT from "./pages/mqtt";
import AboutUs from "./pages/aboutUs"

const MainContent = styled.div`
  position: relative;
  width: ${props => props.expand ? 'calc(100% - 270px)' : 'calc(100% - 80px)'} ;
  margin-left: ${props => props.expand ? '270px' : '80px'};
  transition: 0.3s;
  height: 100vh;
`;

function App() {
  const [sidebarCollapse, setSidebarCollapse] = useState(false)
  return (
    <div>
      <Sidebar collapse={sidebarCollapse} />
      <MainContent expand={!sidebarCollapse} className="bg-light">
        <Navbar setExpand={setSidebarCollapse} expand={!sidebarCollapse} />
        <div className='container px-4 py-3 flex-grow-1'>
          <Routes>
            <Route path='/' element={<Device />} />
            <Route path='/device' element={<Device />} />
            <Route path='/tag' element={<Tag />} />
            <Route path='/protocol' element={<Protocol />} />
            <Route path='/config' element={<Config />} />
            <Route path='/mqtt' element={<MQTT />} />
            <Route path='/about-us' element={<AboutUs />} />
          </Routes>
        </div>
      </MainContent>
    </div>
  );
}

export default App;
