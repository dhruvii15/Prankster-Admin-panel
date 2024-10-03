import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Spinner, Row, Container, Col, ButtonGroup } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

// img
import fontBg1 from "../../assets/images/1.png";
import fontBg2 from "../../assets/images/2.png";
import fontBg3 from "../../assets/images/3.png";
import fontBg4 from "../../assets/images/4.png";
import fontBg5 from "../../assets/images/5.png";

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const Inbox = () => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bgUrls, setBgUrls] = useState([]);
    const [id, setId] = useState();
    const [avatars, setAvatars] = useState([]);
    const [cardTitle, setCardTitle] = useState([]);
    const [nickname, setNickname] = useState('');
    const [selectedBgUrl, setSelectedBgUrl] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [selectedCardTitle, setSelectedCardTitle] = useState([
        { title: '', ansEng: '', ansHi: '', ansEs: '', ansUr: '', ansFr: '', ansPt: '', ansIn: '', ansAr: '' }
    ]);

    const [errors, setErrors] = useState({});
    const [modalMode, setModalMode] = useState('add');

    const [nicknameHi, setNicknameHi] = useState('');
    const [nicknameEs, setNicknameEs] = useState('');
    const [nicknameUr, setNicknameUr] = useState('');
    const [nicknameFr, setNicknameFr] = useState('');
    const [nicknamePt, setNicknamePt] = useState('');
    const [nicknameIn, setNicknameIn] = useState('');
    const [nicknameAr, setNicknameAr] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('eng');

    useEffect(() => {
        fetchBgUrls();
        fetchAvatars();
        fetchCardTitle();
    }, []);

    const fetchBgUrls = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/cardBackground')
            .then((res) => {
                setBgUrls(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch background URLs', err);
                setLoading(false);
            });
    };

    const fetchAvatars = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/avatar')
            .then((res) => {
                setAvatars(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch avatars', err);
                setLoading(false);
            });
    };

    const fetchCardTitle = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/cardTitle/read')
            .then((res) => {
                setCardTitle(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch card titles', err);
                setLoading(false);
            });
    };

    const validate = () => {
        let isValid = true;
        const errors = {};

        if (selectedCardTitle.length === 0 || selectedCardTitle.length > 5) {
            errors.selectedCardTitle = 'You must add up to 5 card titles.';
            isValid = false;
        } else {
            selectedCardTitle.forEach((card, index) => {
                if (!card.title) {
                    errors[`cardTitle${index}`] = 'Card title is required.';
                    isValid = false;
                }
                if (!card.ansEng) {
                    errors[`cardAnsEng${index}`] = 'English answer is required.';
                    isValid = false;
                }
                if (!card.ansHi) {
                    errors[`cardAnsHi${index}`] = 'Hindi answer is required.';
                    isValid = false;
                }
                if (!card.ansEs) {
                    errors[`cardAnsEs${index}`] = 'Spanish answer is required.';
                    isValid = false;
                }
                if (!card.ansUr) {
                    errors[`cardAnsUr${index}`] = 'Urdu answer is required.';
                    isValid = false;
                }
                if (!card.ansFr) {
                    errors[`cardAnsFr${index}`] = 'French answer is required.';
                    isValid = false;
                }
                if (!card.ansPt) {
                    errors[`cardAnsPt${index}`] = 'Portugeese answer is required.';
                    isValid = false;
                }
                if (!card.ansIn) {
                    errors[`cardAnsIn${index}`] = 'Indonesian answer is required.';
                    isValid = false;
                }
                if (!card.ansAr) {
                    errors[`cardAnsAr${index}`] = 'Arabic answer is required.';
                    isValid = false;
                }
            });
        }

        if (selectedLanguage === 'eng' && !nickname) {
            errors.nickname = 'Nickname is required in English.';
            isValid = false;
        }
        if (selectedLanguage === 'hi' && !nicknameHi) {
            errors.nicknameHi = 'Nickname is required in Hindi.';
            isValid = false;
        }
        if (selectedLanguage === 'es' && !nicknameEs) {
            errors.nicknameEs = 'Nickname is required in Spanish.';
            isValid = false;
        }
        if (selectedLanguage === 'ur' && !nicknameUr) {
            errors.nicknameUr = 'Nickname is required in Urdu.';
            isValid = false;
        }
        if (selectedLanguage === 'fr' && !nicknameFr) {
            errors.nicknameFr = 'Nickname is required in French.';
            isValid = false;
        }

        if (selectedLanguage === 'pt' && !nicknamePt) {
            errors.nicknamePt = 'Nickname is required in Portugeese.';
            isValid = false;
        }

        if (selectedLanguage === 'in' && !nicknameIn) {
            errors.nicknameIn = 'Nickname is required in Indonesian.';
            isValid = false;
        }

        if (selectedLanguage === 'ar' && !nicknameAr) {
            errors.nicknameAr = 'Nickname is required in Arabic.';
            isValid = false;
        }

        if (!selectedBgUrl) {
            errors.selectedBgUrl = 'Background image is required.';
            isValid = false;
        }
        if (!selectedAvatar) {
            errors.selectedAvatar = 'Avatar is required.';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };


    const handleCreate = () => {
        const cardTitles = selectedCardTitle.map((card, index) => ({ [`cardtitle${index}`]: card.title }));
        const cardAnswers = selectedCardTitle.map((card, index) => ({
            [`cardans${index}`]: card.ansEng,
            [`cardansHi${index}`]: card.ansHi,
            [`cardansEs${index}`]: card.ansEs,
            [`cardansUr${index}`]: card.ansUr,
            [`cardansFr${index}`]: card.ansFr,
            [`cardansPt${index}`]: card.ansPt,
            [`cardansIn${index}`]: card.ansIn,
            [`cardansAr${index}`]: card.ansAr
        }));

        const payload = {
            username: 'admin',
            nickname,
            nicknameHi,
            nicknameEs,
            nicknameUr,
            nicknameFr,
            nicknamePt,
            nicknameIn,
            nicknameAr,
            bgUrl: selectedBgUrl,
            avatar: selectedAvatar,
            ...Object.assign({}, ...cardTitles),
            ...Object.assign({}, ...cardAnswers)
        };

        return axios.post('https://lolcards.link/api/inbox/create2', payload);
    };


    const handleUpdate = () => {
        const cardTitles = selectedCardTitle.map((card, index) => ({ [`cardtitle${index}`]: card.title }));
        const cardAnswers = selectedCardTitle.map((card, index) => ({
            [`cardans${index}`]: card.ansEng,
            [`cardansHi${index}`]: card.ansHi,
            [`cardansEs${index}`]: card.ansEs,
            [`cardansUr${index}`]: card.ansUr,
            [`cardansFr${index}`]: card.ansFr,
            [`cardansPt${index}`]: card.ansPt,
            [`cardansIn${index}`]: card.ansIn,
            [`cardansAr${index}`]: card.ansAr
        }));

        const payload = {
            username: 'admin',
            nickname,
            nicknameHi,
            nicknameEs,
            nicknameUr,
            nicknameFr,
            nicknamePt,
            nicknameIn,
            nicknameAr,
            bgUrl: selectedBgUrl,
            avatar: selectedAvatar,
            ...Object.assign({}, ...cardTitles),
            ...Object.assign({}, ...cardAnswers)
        };

        return axios.patch(`https://lolcards.link/api/inbox/update/${id}`, payload);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        const apiCall = id !== undefined ? handleUpdate : handleCreate;

        apiCall()
            .then((res) => {
                toast.success(res.data.message);
                resetForm();
                toggleModal('add');
                fetchTableData();
            })
            .catch((err) => {
                console.error(err);
                const errorMessage = err.response?.data?.message || 'An error occurred';
                toast.error(errorMessage);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const resetForm = () => {
        setId(undefined);
        setNickname('');
        setNicknameHi('');
        setNicknameEs('');
        setNicknameUr('');
        setNicknameFr('');
        setNicknamePt('');
        setNicknameIn('');
        setNicknameAr('');
        setSelectedBgUrl('');
        setSelectedAvatar('');
        setSelectedCardTitle([{ title: '', ansEng: '', ansHi: '', ansEs: '', ansUr: '', ansFr: '', ansPt: '', ansIn: '', ansAr: '' }]);
        setSelectedLanguage('eng');
    };

    const handleCardTitleChange = (index, field, value) => {
        const newSelectedCardTitle = [...selectedCardTitle];
        newSelectedCardTitle[index][field] = value.slice(0, 20);
        setSelectedCardTitle(newSelectedCardTitle);
    };

    const addCardTitle = () => {
        if (selectedCardTitle.length < 5) {
            setSelectedCardTitle([...selectedCardTitle, { title: '', ansEng: '', ansHi: '', ansEs: '', ansUr: '', ansFr: '', ansPt: '', ansIn: '', ansAr: '' }]);
        } else {
            toast.warning('You can only add up to 5 card titles.');
        }
    };

    const removeCardTitle = (index) => {
        const newSelectedCardTitle = selectedCardTitle.filter((_, i) => i !== index);
        setSelectedCardTitle(newSelectedCardTitle);
    };

    const toggleModal = (mode) => {
        setModalMode(mode);
        if (mode === 'add') {
            resetForm();
        }
        setVisible(!visible);
        setErrors({});
    };

    const handleEdit = (inbox) => {
        setModalMode('edit');
        setId(inbox._id);
        setNickname(inbox.nickname || '');
        setNicknameHi(inbox.nicknameHi || '');
        setNicknameEs(inbox.nicknameEs || '');
        setNicknameUr(inbox.nicknameUr || '');
        setNicknameFr(inbox.nicknameFr || '');
        setNicknamePt(inbox.nicknamePt || '');
        setNicknameIn(inbox.nicknameIn || '');
        setNicknameAr(inbox.nicknameAr || '');
        setSelectedBgUrl(inbox.bgUrl || '');
        setSelectedAvatar(inbox.avatar || '');

        setSelectedCardTitle(
            inbox.selectedCardTitle.map((card, index) => ({
                title: card.title || '',
                ansEng: card.ans || '',
                ansHi: (inbox.selectedCardTitleHi && inbox.selectedCardTitleHi[index]?.ans) || '',
                ansEs: (inbox.selectedCardTitleEs && inbox.selectedCardTitleEs[index]?.ans) || '',
                ansUr: (inbox.selectedCardTitleUr && inbox.selectedCardTitleUr[index]?.ans) || '',
                ansFr: (inbox.selectedCardTitleFr && inbox.selectedCardTitleFr[index]?.ans) || '',
                ansPt: (inbox.selectedCardTitlePt && inbox.selectedCardTitlePt[index]?.ans) || '',
                ansIn: (inbox.selectedCardTitleIn && inbox.selectedCardTitleIn[index]?.ans) || '',
                ansAr: (inbox.selectedCardTitleAr && inbox.selectedCardTitleAr[index]?.ans) || '',
            })) || [{ title: '', ansEng: '', ansHi: '', ansEs: '', ansUr: '', ansFr: '', ansPt: '', ansIn: '', ansAr: '' }]
        );

        setVisible(true);
    };


    const [tableData, setTableData] = useState([]);
    const [randomAttributes, setRandomAttributes] = useState([]);

    const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

    const fetchTableData = () => {
        axios.post('https://lolcards.link/api/inbox/readadmin', { username: 'admin' })
            .then((res) => {
                if (!res.data.data || res.data.data.length === 0) {
                    toast.warning('No data available');
                    setTableData([]);
                    setRandomAttributes([]);
                    return;
                }

                setTableData(res.data.data);

                const attributes = res.data.data.map(() => ({
                    fontBg: getRandomElement([fontBg1, fontBg2, fontBg3, fontBg4, fontBg5]),
                    font: getRandomElement(['BunnyFunny', 'CCKillJoy', 'Pure', 'SHOWG', 'Spider']),
                    color: getRandomElement(['#4D5D53', '#0D9494', '#CC8899', '#F1C40F', '#42B3AE']),
                    shape: getRandomElement(['circle', 'square', 'heptagon'])
                }));
                setRandomAttributes(attributes);
            })
            .catch((err) => {
                console.error('Failed to fetch table data', err);
                toast.error('Failed to fetch data');
            });
    };

    useEffect(() => {
        fetchTableData();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this ad?")) {
            axios.post('https://lolcards.link/api/inbox/delete', {
                inboxId: id,
                username: 'admin'
            })
                .then(() => {
                    toast.success('Card deleted successfully');
                    fetchTableData();
                })
                .catch(err => {
                    console.error('Failed to delete card', err);
                    toast.error('Failed to delete card');
                });
        }
    };

    if (loading) return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "300px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Inbox</h4>
                    <p>Utilities / Inbox</p>
                </div>
            </div>

            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Inbox</Button>

            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Add New Inbox' : 'Edit Inbox'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className='d-flex gap-5'>
                            <Form.Group className="mb-3">
                                <Form.Label>Language</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                >
                                    <option value="eng">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="es">Spanish</option>
                                    <option value="ur">Urdu</option>
                                    <option value="fr">French</option>
                                    <option value="pt">Portugeese</option>
                                    <option value="in">Indonesian</option>
                                    <option value="ar">Arabic</option>
                                </Form.Control>
                            </Form.Group>


                            {selectedLanguage === 'eng' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nickname.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nickname.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        isInvalid={!!errors.nickname}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nickname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}


                            {selectedLanguage === 'hi' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Hindi)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameHi.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameHi.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Hindi"
                                        value={nicknameHi}
                                        onChange={(e) => setNicknameHi(e.target.value)}
                                        isInvalid={!!errors.nicknameHi}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameHi}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'es' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Spanish)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameEs.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameEs.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Spanish"
                                        value={nicknameEs}
                                        onChange={(e) => setNicknameEs(e.target.value)}
                                        isInvalid={!!errors.nicknameEs}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameEs}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'ur' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Urdu)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameUr.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameUr.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Urdu"
                                        value={nicknameUr}
                                        onChange={(e) => setNicknameUr(e.target.value)}
                                        isInvalid={!!errors.nicknameUr}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameUr}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'fr' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (French)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameFr.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameFr.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in French"
                                        value={nicknameFr}
                                        onChange={(e) => setNicknameFr(e.target.value)}
                                        isInvalid={!!errors.nicknameFr}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameFr}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'pt' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Portugeese)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknamePt.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknamePt.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Portugeese"
                                        value={nicknamePt}
                                        onChange={(e) => setNicknamePt(e.target.value)}
                                        isInvalid={!!errors.nicknamePt}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknamePt}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'in' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Indonesian)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameIn.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameIn.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Indonesian"
                                        value={nicknameIn}
                                        onChange={(e) => setNicknameIn(e.target.value)}
                                        isInvalid={!!errors.nicknameIn}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameIn}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            {selectedLanguage === 'ar' && (
                                <Form.Group className="mb-3">
                                    <div className='d-flex justify-content-between'>
                                        <Form.Label>Nickname (Arabic)</Form.Label>
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: nicknameAr.length >= 10 ? "red" : "inherit"
                                            }}
                                        >
                                            {nicknameAr.length} / 10
                                        </small>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Nickname in Arabic"
                                        value={nicknameAr}
                                        onChange={(e) => setNicknameAr(e.target.value)}
                                        isInvalid={!!errors.nicknameAr}
                                        maxLength={10}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nicknameAr}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Background URL</Form.Label>
                            <CustomDropdown
                                items={bgUrls.map(url => url.cardBg)}
                                selected={selectedBgUrl}
                                onSelect={setSelectedBgUrl}
                                placeholder="Select Background"
                                style={dropdownStyle}
                            />
                            {errors.selectedBgUrl && (
                                <div className="invalid-feedback d-block">
                                    {errors.selectedBgUrl}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Avatar</Form.Label>
                            <CustomDropdown
                                items={avatars.map(avatar => avatar.avatarUrl)}
                                selected={selectedAvatar}
                                onSelect={setSelectedAvatar}
                                placeholder="Select Avatar"
                                style={dropdownStyle}
                            />
                            {errors.selectedAvatar && (
                                <div className="invalid-feedback d-block">
                                    {errors.selectedAvatar}
                                </div>
                            )}
                        </Form.Group>

                        {selectedCardTitle.map((card, index) => (
                            <div key={index} className="mb-3">
                                <Row>
                                    <Form.Group className='col-md-5 col-12'>
                                        <Form.Label className='pt-2'>Card Title {index + 1}</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={card.title || ''}
                                            onChange={(e) => handleCardTitleChange(index, 'title', e.target.value)}
                                            style={{ width: "200px" }}
                                        >
                                            <option value="">Select Card Title</option>
                                            {cardTitle.map((item, idx) => (
                                                <option key={idx} value={item.eng}>{item.eng}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>

                                    {['Eng', 'Hi', 'Es', 'Ur', 'Fr', 'Pt', 'In', 'Ar'].map((lang) => (
                                        <Form.Group key={lang} className='col-md-5 col-7'>
                                            <div className='d-flex justify-content-between pt-2'>
                                                <Form.Label>Answer ({lang}) {index + 1}</Form.Label>
                                                <small
                                                    style={{
                                                        fontSize: "13px",
                                                        color: card[`ans${lang}`]?.length >= 20 ? "red" : "inherit"
                                                    }}
                                                >
                                                    {card[`ans${lang}`]?.length || 0} / 20
                                                </small>
                                            </div>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Enter Answer in ${lang}`}
                                                value={card[`ans${lang}`] || ''}
                                                onChange={(e) => handleCardTitleChange(index, `ans${lang}`, e.target.value)}
                                                maxLength={20}
                                                style={{ width: "200px" }}
                                            />
                                        </Form.Group>
                                    ))}

                                    <Form.Group className="col-md-2 col-5">
                                        <Button
                                            className="mt-4 bg-transparent border-0"
                                            onClick={() => removeCardTitle(index)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className='pt-2 text-danger' />
                                        </Button>
                                    </Form.Group>
                                </Row>
                            </div>
                        ))}


                        {errors.selectedCardTitle && (
                            <div className="invalid-feedback d-block">
                                {errors.selectedCardTitle}
                            </div>
                        )}
                        {modalMode !== 'edit' && (
                            <div className='w-100'>
                                <Button onClick={addCardTitle} className='mb-3'>
                                    Add Card Title
                                </Button>
                            </div>
                        )}

                        <Button type="submit" className='bg-white border-0' disabled={submitting}>
                            {submitting ? <Spinner animation="border" size="sm" /> : (modalMode === 'add' ? 'Submit' : 'Update')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Container className="mt-4">
                <Row className='d-flex justify-content-center align-items-center'>
                    {tableData.map((item, index) => {
                        const { fontBg, font, color, shape } = randomAttributes[index] || {};
                        return (
                            <Col xs={12} sm={6} md={6} xl={3} key={item.id} className='text-center'>
                                <div
                                    className="shadow rounded-3 mt-3 mx-auto position-relative"
                                    style={{
                                        width: "270px",
                                        height: "380px",
                                        backgroundImage: `url(${item.bgUrl})`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}
                                >
                                    {/* Edit and Delete Buttons */}
                                    <ButtonGroup className="position-absolute top-0 end-0 m-2">
                                        <Button variant="light" size="sm" onClick={() => handleEdit(item)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>

                                        <Button size="sm" onClick={() => handleDelete(item._id)} className='bg-white border-0'>
                                            <FontAwesomeIcon icon={faTrash} className='text-danger px-1' />
                                        </Button>
                                    </ButtonGroup>

                                    <div className='py-2 text-center'>
                                        <div className='mx-auto d-flex justify-content-center align-items-center text-center'
                                            style={{
                                                width: "170px",
                                                height: "80px",
                                                backgroundImage: `url(${fontBg})`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundSize: "contain",
                                                backgroundPosition: "center"
                                            }}
                                        >
                                            <p className={`${font} ps-2 fw-bold`} style={{ color: color }}>{item.nickname}</p>
                                        </div>

                                        <img src={item.avatar} alt='avatar' className={`${shape} my-1`} style={{ width: "50%", height: "auto" }} />
                                        <div className='px-2 pt-2 d-flex justify-content-center align-items-center'>
                                            <div className='bg-white d-flex justify-content-center align-items-center' style={{ height: "125px", width: "99%", borderRadius: "10px" }}>
                                                <Row className="w-100 text-start px-2">
                                                    {item.selectedCardTitle.map((value, index) => (
                                                        <React.Fragment key={index}>
                                                            <Col xs={6} className="p-0">
                                                                <p className="mb-2" style={{ fontSize: "10px", fontWeight: "600" }}>
                                                                    {capitalizeFirstLetter(value.title)}
                                                                </p>
                                                            </Col>
                                                            <Col xs={6} className="p-0">
                                                                <p className="mb-2" style={{ fontSize: "10px", fontWeight: "600" }}>
                                                                    <span className="pe-2 fw-bold">:</span>
                                                                    {capitalizeFirstLetter(value.ans)}
                                                                </p>
                                                            </Col>
                                                        </React.Fragment>
                                                    ))}
                                                </Row>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Container>

            <ToastContainer />
        </div>
    );
};

const CustomDropdown = ({ items, selected, onSelect, placeholder, style }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (url) => {
        onSelect(url);
        setIsOpen(false);
    };

    const handleKeyDown = (event, item) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect(item);
        }
    };

    return (
        <div className="custom-dropdown">
            <button
                type="button"  // Add this line
                onClick={() => setIsOpen(!isOpen)}
                className="dropdown-button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
            >
                {selected ? (
                    <img src={selected} alt="Selected" className="selected-image border-0" width={50} height={50} />
                ) : (
                    placeholder
                )}
            </button>
            {isOpen && (
                <div className="dropdown-menu text-center px-4" style={style}>
                    <Row>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="d-flex text-center"
                                onClick={(e) => {
                                    e.preventDefault();  // Add this line
                                    handleSelect(item);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, item)}
                                tabIndex={0}
                                style={{
                                    backgroundImage: `url(${item})`,
                                    backgroundSize: "contain",
                                    backgroundRepeat: "no-repeat",
                                    width: "50px",
                                    height: "50px",
                                    marginTop: "5px",
                                    cursor: 'pointer'
                                }}
                                role="button"
                            >
                            </div>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};


const dropdownStyle = {
    position: 'relative',
    display: 'inline-block'
};

export default Inbox;
