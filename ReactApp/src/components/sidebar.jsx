import { Link } from 'react-router-dom';
import { ProSidebar, Menu, MenuItem, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';
import { Pc, TagFill, HddNetworkFill, Wrench, Globe2, PeopleFill } from 'react-bootstrap-icons'
import styled from 'styled-components';
import { useState } from 'react';
import logo from './logo.png'

const Logo = styled.img`
    width: 50px;
    height: 50px;
    margin-top: 4px;
    margin-left: 13px;
`;

const CustomProSidebar = styled(ProSidebar)`
    height: 100vh;
    position: fixed;
`

function SidebarItem({ icon, active, setActive, path, name, index }) {
    return <MenuItem
        icon={icon}
        active={index === active}
        onClick={() => setActive(index)}
    >
        <Link to={path}>{name}</Link>
    </MenuItem>
}

export default function Sidebar(props) {
    const [active, setActive] = useState(0)

    return <CustomProSidebar style={{ height: '100vh' }} collapsed={props.collapse}>
        <SidebarHeader className='d-flex align-items-center'>
            <Logo src={logo} alt='logo' />
            <span className='text-light fs-5' style={{
                minWidth: '155px',
                overflow: 'hidden',
                display: props.collapse ? 'none' : ''
            }}>
                IoT2050 Gateway
            </span>
        </SidebarHeader>
        <SidebarContent>
            <Menu iconShape="circle">
                <SidebarItem
                    icon={<Pc size={20} />}
                    active={active} index={0}
                    setActive={setActive}
                    path={'/device'}
                    name={'Device'}
                />
                <SidebarItem
                    icon={<TagFill size={20} />}
                    active={active} index={1}
                    setActive={setActive}
                    path={'/tag'}
                    name={'Tag'}
                />
                <SidebarItem
                    icon={<HddNetworkFill size={20} />}
                    active={active} index={2}
                    setActive={setActive}
                    path={'/protocol'}
                    name={'Protocol'}
                />
                <SidebarItem
                    icon={<Wrench size={20} />}
                    active={active} index={3}
                    setActive={setActive}
                    path={'/config'}
                    name={'Config'}
                />
            </Menu>
        </SidebarContent>
        <SidebarFooter>
            <Menu>
                <SidebarItem
                    icon={<Globe2 size={20} />}
                    active={active} index={4}
                    setActive={setActive}
                    path={'/mqtt-client'}
                    name={'MQTT Client'}
                />
            </Menu>
        </SidebarFooter>
        <SidebarFooter>
            <Menu>
                <SidebarItem
                    icon={<PeopleFill size={20} />}
                    active={active} index={4}
                    setActive={setActive}
                    path={'/about-us'}
                    name={'About Us'}
                />
            </Menu>
        </SidebarFooter>
    </CustomProSidebar>;
}