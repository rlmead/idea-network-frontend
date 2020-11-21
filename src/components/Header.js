import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';

function Header(props) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    let history = useHistory();

    return (
        <Navbar color="dark" expand="md" fixed="true">
            <Link to="/">
                <NavbarBrand>Idea Network</NavbarBrand>
            </Link>
            {
                props.currentUser &&
                <>
                    <NavbarToggler onClick={toggle} />
                    <Collapse isOpen={isOpen} navbar>
                        <Nav className="mr-auto" navbar>
                            <NavItem>
                                <Link to={`users/${props.currentUser}`}>
                                    <NavLink>
                                        my profile
                                    </NavLink>
                                </Link>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    onClick={() => {
                                        props.setCurrentUser(null);
                                        history.push('/')
                                    }}>
                                    log out
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </>
            }
        </Navbar>
    )
}

export default Header;