import React, { useContext } from 'react';
import Header from '../components/Header.js';
import { useState } from 'react';
import { Row, Col, Input, Button } from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import AppContext from '../utilities/AppContext.js';

function LogIn() {
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    
    const context = useContext(AppContext);

    let history = useHistory();

    async function logIn(emailAddress) {
        let result = await context.getData('/users/get_id', { 'email': emailAddress });
        context.setCurrentUser(result.data);
        history.push(`/users/${result.data}`);
    }

    async function authenticateUser() {
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json; charset=utf-8"
        };
        axios({
            url: "http://127.0.0.1:8000/v1/oauth/token",
            method: "post",
            data: {
                grant_type: "password",
                client_id: '2',
                client_secret: "iOgp23lMwnBdyHOmpglk56acuSMGIEAJAmNCPXGq",
                password: password,
                username: emailAddress,
                scope: ""
            },
            headers
        })
            .then(await logIn(emailAddress))
            .catch(error => console.log(error))
    }



    return (
        <>
            <Header/>
            <Row>
                <Col sm='6'>
                    <Input
                        type="text"
                        placeholder="email address"
                        onChange={(e) => setEmailAddress(e.target.value)} />
                    <Input
                        type="password"
                        placeholder="password"
                        onChange={(e) => setPassword(e.target.value)} />
                    <Button
                        onClick={() => authenticateUser()}
                        disabled={emailAddress.length === 0 || password.length === 0}>
                        log in!
                </Button>
                </Col>
                <Col sm='6'>
                    <Row>
                        <Col>
                            <Link to="signup">
                                <Button>
                                    sign up
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Link to="users">
                                <Button>
                                    browse anonymously
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default LogIn;