import React, { useEffect, useState } from "react";
import { Button, Row, Col, Nav, NavItem, NavLink, Input, ListGroup, ListGroupItem } from "reactstrap";
import { Link, useHistory, useParams } from "react-router-dom";
import { useApp } from "../utilities/AppContext";
import { useAuth } from "../utilities/AuthContext";
import { axiosCall } from "../utilities/axiosCall";
import { countryCodes } from "../utilities/countryCodes";
import Editable from "./Editable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

function Idea() {
  const { user } = useApp();
  const { token } = useAuth();

  let { ideaId } = useParams();

  let history = useHistory();

  const [ideaData, setIdeaData] = useState({});
  const [ideaUsers, setIdeaUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [view, setView] = useState("About");
  const [addingComment, setAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const views = ["About", "People", "Discussion"];

  let currentUserOwnsIdea = (
    user.id
    && ideaUsers.map(item => item.id).includes(user.id)
    && ideaUsers.filter(item => item.id === user.id)[0].role === "creator");

  let currentUserIsCollaborator = (
    user.id
    && ideaUsers.map(item => item.id).includes(user.id)
    && ideaUsers.filter(item => item.id === user.id)[0].role === "collaborator");

  let collabRequested = (
    user.id
    && ideaUsers.map(item => item.id).includes(user.id)
    && ideaUsers.filter(item => item.id === user.id)[0].role === "request");

  let postHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Authorization": `Bearer ${token}`
  };

  async function getIdeaById() {
    let response = await axiosCall(
      "get",
      `/ideas/${ideaId}`,
      setIdeaData,
      {},
      postHeaders
    );
    return response;
  }

  function parseUserData(input) {
    let output = [];
    for (let i = 0; i < input.length; i++) {
      output.push({
        role: input[i].pivot.user_role,
        id: input[i].id,
        name: input[i].name
      });
    }
    output.sort((a, b) => a.role < b.role ? 1 : -1);
    setIdeaUsers(output);
  }

  async function getIdeaUsers() {
    let response = await axiosCall(
      "post",
      "/ideas/get_users",
      parseUserData,
      {
        id: ideaId
      },
      postHeaders
    );
    return response;
  }

  async function getComments() {
    let response = await axiosCall(
      "get",
      `/comments/${ideaId}`,
      setComments,
      {},
      postHeaders
    );
    return response;
  }

  async function requestCollab() {
    await axiosCall(
      "post",
      "/request_collab",
      console.log,
      {
        idea_id: ideaId,
        user_id: user.id,
        user_role: "request"
      },
      postHeaders
    );
  }

  async function addComment() {
    await axiosCall(
      "post",
      "/comments/add",
      console.log,
      {
        idea_id: ideaId,
        user_id: user.id,
        text: newComment
      },
      postHeaders
    );
  }

  async function deleteComment(commentId) {
    await axiosCall(
      "post",
      "/comments/delete",
      console.log,
      {
        id: commentId
      },
      postHeaders
    );
  }

  function addCommentKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      newComment !== "" && addComment() && getComments();
      setAddingComment(!addingComment);
    }
  }

  useEffect(() => {
    getIdeaById();
    getIdeaUsers();
    getComments();
  }, [ideaId])

  const editables = {
    main: [
      { field: "name", staticElementType: "h4", content: ideaData.name },
      { field: "image_url", staticElementType: "img", content: ideaData.image_url }
    ],
    about: [
      { name: (ideaData.description || currentUserOwnsIdea) ? "Description" : null, field: "description", inputElementType: "textarea", content: ideaData.description },
      { name: (ideaData.status || currentUserOwnsIdea) ? "Status" : null, field: "status", inputElementType: "select", content: ideaData.status, inputOptions: ["", "open", "closed"] },
      { name: (ideaData.location || currentUserOwnsIdea) ? "Location" : null, field: "location_id", inputElementType: "location", inputOptions: countryCodes, staticElementType: "location", locationData: ideaData.location },
    ]
  }

  function switchView(view) {
    switch (view) {
      case "About":
        return (
          editables.about.map((item, index) => {
            return (
              <>
                { item.name && <h5>{item.name}</h5>}
                <Editable
                  key={`editable-about-${index}`}
                  canEdit={currentUserOwnsIdea}
                  table="ideas"
                  rowId={ideaId}
                  refreshFunction={getIdeaById}
                  field={item.field}
                  inputElementType={item.inputElementType}
                  content={item.content || null}
                  staticElementType={item.staticElementType || null}
                  inputOptions={item.inputOptions || null}
                  locationData={item.locationData || null} />
              </>
            )
          })
        )
      case "People":
        return (
          <ListGroup
            flush
            className='text-left'>
            {
              ideaUsers.map((item, index) => {
                return (
                  (currentUserOwnsIdea
                    || (!currentUserOwnsIdea && item.role !== "request")) &&
                  <ListGroupItem
                    style={{ cursor: "pointer" }}
                    key={`listItem-${index}`}>
                    <Row>
                      <Col sm="8">
                        <h4 onClick={() => history.push(`/users/${item.id}`)}>{item.name}</h4>
                      </Col>
                      <Col sm="4">
                        <Editable
                          canEdit={(currentUserOwnsIdea && item.role === "request")}
                          content={item.role}
                          staticElementType="h5"
                          inputElementType="collabRequest"
                          ideaId={ideaId}
                          userId={item.id}
                          refreshFunction={getIdeaUsers} />
                      </Col>
                    </Row>
                  </ListGroupItem>
                )
              })
            }
          </ListGroup>
        )
      case "Discussion":
        return (
          <>
            <FontAwesomeIcon
              icon={addingComment ? faSave : faPlus}
              size="2x"
              className="text-success"
              onClick={() => {
                addingComment && newComment !== "" && addComment();
                setAddingComment(!addingComment);
              }}
            />
            {
              addingComment &&
              <textarea
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => addCommentKeyPress(e)}
                style={{ width: "100%" }} />
            }
            <ListGroup
              flush
              className='text-left'>
              {
                comments.map((item, index) => {
                  return (
                    <ListGroupItem
                      key={`listItem-${index}`}>
                      <Row>
                        <Col sm="8">
                          <p>{item.text}</p>
                        </Col>
                        <Col sm="4">
                          <Link
                            to={`/users/${item.users.id}`}
                            className="text-dark"
                            style={{ textDecoration: "none" }}>
                            <h5>{item.users.name}</h5>
                          </Link>
                          <p>{item.updated_at.split('T')[0] + ' ' + item.updated_at.split('T')[1].split('.')[0]}</p>
                          {
                            item.users.id === user.id &&
                            <div className="text-right">
                              <FontAwesomeIcon
                                icon={faTrashAlt}
                                className="text-success"
                                onClick={() => {
                                  deleteComment(item.id) && getComments();
                                }}
                              />
                            </div>
                          }
                        </Col>
                      </Row>
                    </ListGroupItem>
                  )
                })
              }
            </ListGroup>
          </>
        )
      default:
        return (
          <p>under construction</p>
        )
    }
  };

  return (
    (Object.keys(ideaData).length > 0)
      ?
      <Row>
        <Col sm="3">
          {
            editables.main.map((item, index) => {
              return (
                <>
                  <Editable
                    key={`editable-main-${index}`}
                    canEdit={currentUserOwnsIdea}
                    table="ideas"
                    rowId={ideaId}
                    refreshFunction={getIdeaById}
                    staticElementType={item.staticElementType}
                    field={item.field}
                    content={item.content} />
                </>
              )
            })
          }
          {
            !currentUserOwnsIdea && !currentUserIsCollaborator && ideaData.status === "open" &&
            <Button
              className="btn-success"
              onClick={() => requestCollab() && getIdeaUsers()}
              disabled={collabRequested}>
              {
                collabRequested
                  ? "Collaboration Requested"
                  : "Request to Collaborate"
              }
            </Button>
          }
        </Col>
        <Col sm="9" style={{ textAlign: "left" }}>
          <Nav
            justified
            tabs
            className="bg-light fixed-bottom">
            {
              views.map((item, index) => {
                return (
                  <NavItem
                    key={"button-" + index}>
                    <NavLink
                      className={(view === item) ? "active" : ""}
                      id={item}
                      onClick={() => setView(item)}>
                      <h5>{item}</h5>
                    </NavLink>
                  </NavItem>
                )
              })
            }
          </Nav>
          {switchView(view)}
        </Col>
      </Row >
      :
      <Row>
        <Col>
          <h3 className="text-left">Loading...</h3>
        </Col>
      </Row>
  )
}

export default Idea;