import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import { faCopy } from '@fortawesome/free-regular-svg-icons';

const UserAudio = () => {
    const category = [
        { CategoryId: 1, CategoryName: 'Trending' },
        { CategoryId: 2, CategoryName: 'Nonveg' },
        { CategoryId: 3, CategoryName: 'Hot' },
        { CategoryId: 4, CategoryName: 'Funny' },
        { CategoryId: 5, CategoryName: 'Horror' },
        { CategoryId: 6, CategoryName: 'Celebrity' }
    ];

    const language = [
        { LanguageId: 1, LanguageName: 'Hindi' },
        { LanguageId: 2, LanguageName: 'English' },
        { LanguageId: 3, LanguageName: 'Marathi' },
        { LanguageId: 4, LanguageName: 'Gujarati' },
        { LanguageId: 5, LanguageName: 'Tamil' },
        { LanguageId: 6, LanguageName: 'Punjabi' }
    ];

    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        languageId: '',
        artistName: '',
        audioName: '',
        audioPremium: false,
        safe: false,
        hide: false
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/users/read', { TypeId: "1" })
            .then((res) => {
                const newData = res.data.data.reverse();
                setFilteredData(newData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    useEffect(() => {
        getData();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedAudio(null);
        setFormData({
            categoryId: '',
            languageId: '',
            artistName: '',
            audioName: '',
            audioPremium: false,
            safe: false,
            hide: false
        });
    };

    const handleModalShow = (audio) => {
        setSelectedAudio(audio);
        setFormData({
            categoryId: '',
            languageId: '',
            artistName: '',
            audioName: audio.AudioName,
            audioPremium: false,
            safe: false,
            hide: false
        });
        setShowModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        if (!formData.categoryId) {
            errors.categoryId = "Please select a Prank Category.";
        }

        if (!formData.languageId) {
            errors.languageId = "Please select a Prank Language.";
        }

        if (!formData.audioName.trim()) {
            errors.audioName = "Audio name is required.";
        }
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setFormLoading(true);

        const submitFormData = new FormData();
        submitFormData.append('AudioName', formData.audioName);
        submitFormData.append('Audio', selectedAudio.Audio);
        submitFormData.append('AudioPremium', formData.audioPremium);
        submitFormData.append('Safe', formData.safe);
        submitFormData.append('role', selectedAudio._id);
        submitFormData.append('CategoryId', formData.categoryId);
        submitFormData.append('LanguageId', formData.languageId);
        submitFormData.append('ArtistName', formData.artistName);
        submitFormData.append('Hide', formData.safe);

        if (window.confirm("Are you sure you want to move this Audio?")) {
            axios.post('https://pslink.world/api/audio/create', submitFormData)
                .then(() => {
                    getData();
                    toast.success('Audio Move Successfully');
                    handleModalClose();
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                })
                .finally(() => {
                    setFormLoading(false);
                });
        } else {
            setFormLoading(false);
        }
    };

    const handleCopyToClipboard = (audio) => {
        if (audio) {
            navigator.clipboard.writeText(audio)
                .then(() => {
                    toast.success("Audio URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 4;

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

    const handleDelete = (audioId) => {
        if (window.confirm("Are you sure you want to delete this Audio?")) {
            axios.delete(`https://pslink.world/api/users/delete/${audioId}?TypeId=1`)
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

    const handleDownload = (fileUrl) => {
        fetch(fileUrl)
            .then((response) => response.blob()) // Convert the file to a Blob
            .then((blob) => {
                const url = window.URL.createObjectURL(blob); // Create an object URL
                const link = document.createElement('a');
                link.href = url;
                link.download = 'audio-file.mp3'; // Set the default download filename as .mp3
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url); // Release the URL object
            })
            .catch((error) => console.error('Download failed:', error));
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
            <div className="dots-loader">
                <span></span><span></span><span></span>
            </div>
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center pb-5'>
                <div>
                    <h4>Audio </h4>
                </div>
            </div>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Audio Name</th>
                        <th>Audio</th>
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
                                        className="edit-dlt-btn"
                                        onClick={() => handleDownload(audio.Audio)} // Pass your image URL here
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </Button>
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(audio.Audio)}
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                    <Button
                                        className='edit-dlt-btn'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleModalShow(audio)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button
                                        className='edit-dlt-btn text-danger'
                                        onClick={() => handleDelete(audio._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for category selection and artist name */}
            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Header>
                    <Modal.Title>Move Audio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Audio Name<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter audio name"
                                className='py-2'
                                value={formData.audioName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, audioName: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        audioName: value.trim() ? '' : prevErrors.audioName,
                                    }));
                                }}
                                isInvalid={!!formErrors.audioName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.audioName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Category Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Prank Category<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.categoryId}
                                className='py-2'
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, categoryId: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        categoryId: value ? '' : prevErrors.categoryId,
                                    }));
                                }}
                                isInvalid={!!formErrors.categoryId}
                            >
                                <option value="">Select a Prank Category</option>
                                {category.map((cat) => {
                                        return (
                                            <option key={cat._id} value={cat.CategoryId}>
                                                {cat.CategoryName}
                                            </option>
                                        );
                                })}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.categoryId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Prank Language<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.languageId}
                                className='py-2'
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, languageId: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        languageId: value ? '' : prevErrors.languageId,
                                    }));
                                }}
                                isInvalid={!!formErrors.languageId}
                            >
                                <option value="">Select a Prank Language</option>
                                {language.map((cat) => {
                                        return (
                                            <option key={cat._id} value={cat.LanguageId}>
                                                {cat.LanguageName}
                                            </option>
                                        );
                                })}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.languageId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Artist Name Input */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Artist Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter artist name"
                                className='py-2'
                                value={formData.artistName}
                                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                            />
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="AudioPremium"
                                    label="Premium Audio Prank"
                                    checked={formData.audioPremium}
                                    onChange={(e) => setFormData({ ...formData, audioPremium: e.target.checked })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Safe"
                                    label="Safe Audio Prank"
                                    checked={formData.safe}
                                    onChange={(e) => setFormData({ ...formData, safe: e.target.checked })}
                                />
                            </Form.Group>
                        </div>

                        <Row className="mt-5">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={handleModalClose}
                                    disabled={formLoading}
                                    className='w-100 rounded-3 text-black'
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    className='submit border-0 rounded-3 w-100'
                                    disabled={formLoading}
                                >
                                    {formLoading ? <Spinner size='sm' /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>


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

export default UserAudio;