import React from 'react';
// ** React Imports
import { useState, useEffect } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { formatDateToMonthShort } from '@utils'

// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { X, Search, Bell, Plus } from 'react-feather'
import {
  CardText, InputGroup, InputGroupAddon,
  Input, InputGroupText, CustomInput, Button, Modal, ModalBody, Row, Col
} from 'reactstrap'


import NotFound from '../../components/not-found';
import NoNetwork from '../../components/no-network';

import { notifyError, notifySuccess } from '../../utility/toast'

import UILoader from '../../@core/components/ui-loader';

import { GET_IMAGE_URL } from './../../helpers/url_helper';

import { getPreviousMessages } from './socket/events'


const SidebarLeft = props => {
  // ** Props & Store
  const { sidebar, handleUserSidebarLeft, handleSidebar, userSidebarLeft, socket, store } = props

  const {
    setNotificationEnabled,
    isNotificationEnabled,
    selectChat, selectedChat,
    user, chats, chatLoading, updateAbout,
    newChatLoading,
    newChatError,
    createChat,
    getAllTeachers,
    teachersList,
    teachersListLoading,
    teachersListError,
  } = store

  // ** State
  const [about, setAbout] = useState('')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState({})
  const [status, setStatus] = useState('online')
  const [filteredChat, setFilteredChat] = useState([])

  const [isNewChat, setIsNewChat] = useState(false)
  const [userQuery, setUserQuery] = useState('')

  // ** Handles User Chat Click
  const handleUserClick = (chat, socket) => {
    selectChat(chat)
    getPreviousMessages(socket, chat.chatId)
  }

  // ** Renders Chat
  const renderChats = () => {

    if (chats && chats.length) {
      if (query.length && !filteredChat.length) {
        return (
          <li className='no-results show'>
            <h6 className='mb-0'>No Chats Found</h6>
          </li>
        )
      } else {
        const arrToMap = query.length && filteredChat.length ? filteredChat : chats

        return arrToMap.map(item => {
          const time = formatDateToMonthShort(item.messages.length > 0 ? item.messages[0].createdAt : new Date())

          return (
            <li
              className={item.chatId == selectedChat.chatId ? "active" : ""}
              key={item.chatId}
              onClick={() => handleUserClick(item, socket)}
            >
              <Avatar
                img={GET_IMAGE_URL(item.type == 'group'
                  ? item.groupPicture || null
                  : item.chatParticipants.find(u => u.user.userId != user.userId).user.profilePicture)
                }
                imgHeight='42' imgWidth='42' status={item.status} />
              <div className='chat-info flex-grow-1'>
                <h5 className='mb-0'>
                  {item.type == 'group'
                    ? item.groupName
                    : item.chatParticipants.find(u => u.user.userId != user.userId).user.name}
                </h5>
                <CardText className='text-truncate'>
                  {
                    item.chatParticipants.find(u => u.user.userId == user.userId && !u.blockedAt) ?
                      <>
                        {item.messages.length > 0 ? item.messages[0].content : ''}
                      </>
                      :
                      '...'
                  }

                </CardText>
              </div>
              <div className='chat-meta text-nowrap'>
                <small className='float-right mb-25 chat-time ml-25'>{time}</small>
                {/* {item.chat.unseenMsgs >= 1 ? (
                  <Badge className='float-right' color='danger' pill>
                    {item.chat.unseenMsgs}
                  </Badge>
                ) : null} */}
              </div>
            </li>
          )
        })
      }
    } else {
      return null
    }
  }

  // ** Handles Filter
  const handleFilter = e => {
    setQuery(e.target.value)
    let val = e.target.value || "";
    const searchFilterFunction = chat => chat.chatParticipants.find(p => p.user.name.toLowerCase().includes(val.toLowerCase())) ||
      (chat.groupName || "").toLowerCase().includes(val.toLowerCase())

    const filteredChatsArr = chats.filter(searchFilterFunction)
    setFilteredChat([...filteredChatsArr])
  }

  const onNotificationChange = (e) => {
    console.log(e.target.checked)
    setNotificationEnabled(e.target.checked)
  }

  const saveAbout = (e) => {
    e.preventDefault()
    console.log("ABOUT___", e.target.value)
    updateAbout({ about: e.target.value })
  }


  useEffect(() => {
    if (isNewChat && !newChatLoading && newChatError) {
      setIsNewChat(false)
      notifyError("New Chat", newChatError)
    }
    else if (isNewChat && !newChatLoading && !newChatError) {
      setIsNewChat(false)
      if (chats.length > 0) handleUserClick(chats[chats.length - 1], socket)
      notifySuccess("New Chat", 'Chat started Successfully')
    }
  }, [newChatLoading])


  const getChatByUserId = (id) => {
    return chats
      .filter(ct => ct.type == "chat")
      .find(c => c.chatParticipants.find(p => p.user.userId == id))
  }

  const openNewChatModel = () => {
    setIsNewChat(true);
    getAllTeachers();
  }

  const startNewChat = (id) => {
    createChat({
      participants: [id],
      type: "chat"
    })
  }



  return (
    <div className='sidebar-left'>
      <div className='sidebar'>
        <div
          className={classnames('chat-profile-sidebar', {
            show: userSidebarLeft
          })}
        >
          <header className='chat-profile-header'>
            <div className='close-icon' onClick={handleUserSidebarLeft}>
              <X size={14} />
            </div>
            <div className='header-profile-sidebar'>
              <Avatar className='box-shadow-1 avatar-border'
                img={GET_IMAGE_URL(user.profilePicture)}
                status={status}
                size='xl' />
              <h4 className='chat-user-name'>{user.name}</h4>
              {/* <span className='user-post'>{user.role}</span> */}
            </div>
          </header>
          <PerfectScrollbar className='profile-sidebar-area' options={{ wheelPropagation: false }}>
            <h6 className='section-label mb-1'>About</h6>
            <div className='about-user'>
              <Input
                rows='5'
                defaultValue={user.about}
                type='textarea'
                onBlur={e => saveAbout(e)}
                onChange={e => setAbout(e.target.value)}
                className={classnames('char-textarea', {
                  'text-danger': about && about.length > 120
                })}
              />
              <small className='counter-value float-right'>
                <span className='char-count'>{user.about ? user.about.length : 0}</span>/ 120
              </small>
            </div>
            <h6 className='section-label mb-1 mt-3'>Status</h6>
            <ul className='list-unstyled user-status'>
              <li className='pb-1'>
                <CustomInput
                  type='radio'
                  className='custom-control-primary'
                  id='online'
                  label='Online'
                  onChange={e => setStatus('online')}
                  checked={status === 'online'}
                />
              </li>
              <li className='pb-1'>
                <CustomInput
                  type='radio'
                  className='custom-control-danger'
                  id='busy'
                  label='Do Not Disturb'
                  onChange={e => setStatus('busy')}
                  checked={status === 'busy'}
                />
              </li>
              <li className='pb-1'>
                <CustomInput
                  type='radio'
                  className='custom-control-warning'
                  id='away'
                  label='Away'
                  onChange={e => setStatus('away')}
                  checked={status === 'away'}
                />
              </li>
              <li className='pb-1'>
                <CustomInput
                  type='radio'
                  className='custom-control-secondary'
                  id='offline'
                  label='Offline'
                  onChange={e => setStatus('offline')}
                  checked={status === 'offline'}
                />
              </li>
            </ul>
            <h6 className='section-label mb-1 mt-2'>Settings</h6>
            <ul className='list-unstyled'>
              <li className='d-flex justify-content-between align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <Bell className='mr-75' size='18' />
                  <span className='align-middle'>Notification</span>
                </div>
                <CustomInput
                  type='switch'
                  defaultChecked={isNotificationEnabled}
                  id='notifications'
                  name='notifications'
                  label=''
                  onChange={onNotificationChange} />
              </li>
            </ul>
          </PerfectScrollbar>
        </div>
        <div
          className={classnames('sidebar-content', {
            show: sidebar === true
          })}
        >
          <div className='sidebar-close-icon' onClick={handleSidebar}>
            <X size={14} />
          </div>
          <div className='chat-fixed-search'>
            <div className='d-flex align-items-center w-100'>
              <div className='sidebar-profile-toggle' onClick={handleUserSidebarLeft}>
                {Object.keys(user).length ? (
                  <Avatar
                    className='avatar-border'
                    img={GET_IMAGE_URL(user.profilePicture || null)}
                    status={status}
                    imgHeight='42'
                    imgWidth='42'
                  />
                ) : null}
              </div>
              <InputGroup className='input-group-merge ml-1 w-100'>
                <InputGroupAddon addonType='prepend'>
                  <InputGroupText className='round'>
                    <Search className='text-muted' size={14} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  value={query}
                  className='round'
                  placeholder='Search chat'
                  onChange={handleFilter}
                />
              </InputGroup>
            </div>

            <div className="d-flex  justify-content-center align-items-center pl-1">
              <Button.Ripple
                color="flat-primary"
                className="btn btn-icon btn-sm"
                onClick={() => openNewChatModel()}
              >
                <Plus size='18' />
              </Button.Ripple>
            </div>

          </div>
          <PerfectScrollbar className='chat-user-list-wrapper list-group' options={{ wheelPropagation: false }}>
            <h4 className='chat-list-title'>Chats</h4>
            <ul className='chat-users-list chat-list media-list'>
              <UILoader blocking={chatLoading}>
                {renderChats()}
              </UILoader>
            </ul>
          </PerfectScrollbar>
        </div>
      </div>
      <Modal isOpen={isNewChat} className="pt-5">
        <UILoader blocking={newChatLoading || teachersListLoading}>
          <ModalBody className="p-2">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="m-0">New Chat</h3>
              <X
                size={16}
                onClick={() => setIsNewChat(false)}
              />
            </div>
            <div className="mt-2">
              <InputGroup className='input-group-merge'>
                <Input placeholder='Search here' value={userQuery} onChange={e => setUserQuery(e.target.value)} />
                <InputGroupAddon addonType='append'>
                  <InputGroupText>
                    {
                      !userQuery &&
                      <Search size={14} />
                    }
                    {
                      userQuery &&
                      <X size={14} onClick={() => setUserQuery('')} />
                    }
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>

              <div className="mt-2">
                {
                  teachersList.length == 0 ? <NotFound message="No user Available for new chat" /> :
                    teachersList
                      .filter(u => u.name.toLowerCase().includes(userQuery.toLowerCase()))
                      .map((s, index) =>
                        <Row key={'non-connected' + index}>
                          <Col sm='12'>
                            <div className=" new-chat-head-item d-flex justify-content-lg-between align-items-center mb-1">
                              <div className="d-flex align-items-center">
                                <Avatar
                                  img={GET_IMAGE_URL(s.profilePicture)} size='sm' />
                                <h5 className="m-0 ml-25">
                                  {
                                    s.name
                                  }
                                </h5>
                              </div>
                              <div className="action-btn">
                                {
                                  !getChatByUserId(s.userId) &&
                                  <Button.Ripple
                                    color='primary'
                                    className="btn btn-sm"
                                    onClick={() => startNewChat(s.userId)}
                                  >
                                    Start Conversation
                                  </Button.Ripple>
                                }
                              </div>
                            </div>
                          </Col>
                        </Row>)
                }
              </div>
            </div>
          </ModalBody>
        </UILoader>
      </Modal>
    </div>
  )
}

export default SidebarLeft
