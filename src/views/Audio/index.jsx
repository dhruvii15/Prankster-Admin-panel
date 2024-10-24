import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const Audio = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Audio Image Upload');
    const [audioFileLabel, setAudioFileLabel] = useState('Audio File Upload');
    const [selectedAudio, setSelectedAudio] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Audio Image Upload');
                setAudioFileLabel('Audio File Upload');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setImageFileLabel('Audio Image Upload');
            setAudioFileLabel('Audio File Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/audio/read')
            .then((res) => {
                const newData = res.data.data.reverse();
                setData(newData);
                setFilteredData(newData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    // Add useEffect for filtering
    useEffect(() => {
        filterAudioData();
    }, [selectedAudio, data]);

    // Add filtering function
    const filterAudioData = () => {
        let filtered = [...data];

        switch (selectedAudio) {
            case "Hide":
                filtered = data.filter(item => item.Hide === true);
                break;
            case "Unhide":
                filtered = data.filter(item => item.Hide === false);
                break;
            case "Premium":
                filtered = data.filter(item => item.AudioPremium === true);
                break;
            case "Free":
                filtered = data.filter(item => item.AudioPremium === false);
                break;
            default:
                filtered = data;
        }

        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const getCharacters = () => {
        axios.post('https://pslink.world/api/character/read')
            .then((res) => {
                setCharacters(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch characters.");
            });
    };

    useEffect(() => {
        getData();
        getCharacters();
    }, []);

    const audioSchema = Yup.object().shape({
        AudioName: Yup.string().required('Audio Name is required'),
        AudioImage: Yup.mixed().required('Audio Image is required'),
        Audio: Yup.mixed().required('Audio File is required'),
        AudioPremium: Yup.boolean(),
        CharacterId: Yup.string().required('Character Name is required'),
        Hide: Yup.boolean(),  // Add Hide field to schema
    });

    const formik = useFormik({
        initialValues: {
            AudioName: '',
            AudioImage: '',
            Audio: '',
            AudioPremium: false,
            CharacterId: '',
            Hide: false,  // Add Hide field to initial values
        },
        validationSchema: audioSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('AudioName', values.AudioName);
            formData.append('AudioImage', values.AudioImage);
            formData.append('Audio', values.Audio);
            formData.append('AudioPremium', values.AudioPremium);
            formData.append('CharacterId', values.CharacterId);
            formData.append('Hide', values.Hide);  // Add Hide field to formData

            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/audio/update/${id}`, formData)
                : axios.post('https://pslink.world/api/audio/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Audio Image Upload');
                setAudioFileLabel('Audio File Upload');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            }).catch((err) => {
                console.error(err);
                setSubmitting(false);
                toast.error("An error occurred. Please try again.");
            });
        },
    });

    const handleEdit = (audio) => {
        formik.setValues({
            AudioName: audio.AudioName,
            AudioImage: audio.AudioImage,
            Audio: audio.Audio,
            AudioPremium: audio.AudioPremium,
            CharacterId: audio.CharacterId,
            Hide: audio.Hide,  // Set Hide value when editing
        });
        setId(audio._id);
        setImageFileLabel('Audio Image Upload');
        setAudioFileLabel('Audio File Upload');
        toggleModal('edit');
    };

    const handlePremiumToggle = (audioId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/audio/update/${audioId}`, { AudioPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleHideToggle = (audioId, currentHideStatus) => {
        axios.patch(`https://pslink.world/api/audio/update/${audioId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (audioId) => {
        if (window.confirm("Are you sure you want to delete this Audio?")) {
            axios.delete(`https://pslink.world/api/audio/delete/${audioId}`)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    // Pagination logic
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 8;

        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

        if (endPage - startPage < totalPagesToShow - 1) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return items;
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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Audio Files</h4>
                    <p>Category / Audio Management</p>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#FA5D4D", color: "white" }}
                >
                    Add New Audio
                </Button>
                <Form.Select
                    value={selectedAudio}
                    onChange={(e) => setSelectedAudio(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Audio" : "Add New Audio"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Audio Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="AudioName"
                                name="AudioName"
                                value={formik.values.AudioName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.AudioName && !!formik.errors.AudioName}
                            />
                            {formik.errors.AudioName && formik.touched.AudioName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.AudioName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{imageFileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="AudioImage"
                                    name="AudioImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("AudioImage", file);
                                        setImageFileLabel(file ? "Audio Image uploaded" : "Audio Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="AudioImage" className="btn border bg-white mb-0">Select Audio Image</label>
                            </div>
                            {formik.errors.AudioImage && formik.touched.AudioImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.AudioImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{audioFileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="Audio"
                                    name="Audio"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("Audio", file);
                                        setAudioFileLabel(file ? "Audio File uploaded" : "Audio File Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="Audio" className="btn border bg-white mb-0">Select Audio File</label>
                            </div>
                            {formik.errors.Audio && formik.touched.Audio && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Audio}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="AudioPremium"
                                name="AudioPremium"
                                label="Premium Audio"
                                checked={formik.values.AudioPremium}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="Hide"
                                name="Hide"
                                label="Hide Audio"
                                checked={formik.values.Hide}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Character Name</Form.Label>
                            <Form.Control
                                as="select"
                                id="CharacterId"
                                name="CharacterId"
                                value={formik.values.CharacterId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CharacterId && !!formik.errors.CharacterId}
                            >
                                <option value="">Select a character</option>
                                {characters.map((character) => {
                                    if (character.Category === 'audio') {
                                        return (
                                            <option key={character._id} value={character.CharacterId}>
                                                {character.CharacterName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for characters not in the audio category
                                })}
                            </Form.Control>
                            {formik.errors.CharacterId && formik.touched.CharacterId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CharacterId}
                                </div>
                            )}
                        </Form.Group>

                        <Button type="submit" className='bg-white border-0' disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Audio Name</th>
                        <th>Audio Image</th>
                        <th>Audio File</th>
                        <th>Premium</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((audio, index) => (
                            <tr key={audio._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{audio.AudioName}</td>
                                <td>
                                    <img src={audio.AudioImage} alt="Audio thumbnail" style={{ width: '50px', height: '50px' }} />
                                </td>
                                <td>
                                    <audio controls>
                                        <source src={audio.Audio} type="audio/mpeg" />
                                        <track
                                            kind="captions"
                                            src={audio.AudioName}
                                            srcLang="en"
                                            label="English"
                                            default
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                </td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: audio.AudioPremium ? "#0385C3" : "#6c757d" }}
                                        onClick={() => handlePremiumToggle(audio._id, audio.AudioPremium)}
                                    >
                                        <FontAwesomeIcon
                                            icon={audio.AudioPremium ? faToggleOn : faToggleOff}
                                            title={audio.AudioPremium ? "Premium ON" : "Premium OFF"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleHideToggle(audio._id, audio.Hide)}>
                                        <FontAwesomeIcon icon={audio.Hide ? faEyeSlash : faEye} />
                                    </Button></td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(audio)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(audio._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Audio;