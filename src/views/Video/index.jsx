import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";

const Video = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Video Image Upload');
    const [videoFileLabel, setVideoFileLabel] = useState('Video File Upload');


    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Video Image Upload');
                setVideoFileLabel('Video File Upload');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setImageFileLabel('Video Image Upload');
            setVideoFileLabel('Video File Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5001/api/video/read')
            .then((res) => {
                setData(res.data.data.reverse());
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const getCharacters = () => {
        axios.post('http://localhost:5001/api/character/read')
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

    const videoSchema = Yup.object().shape({
        VideoName: Yup.string().required('Video Name is required'),
        VideoImage: Yup.mixed().required('Video Image is required'),
        Video: Yup.mixed().required('Video File is required'),
        VideoPremium: Yup.boolean(),
        CharacterId: Yup.string().required('Character Name is required'),
    });

    const formik = useFormik({
        initialValues: {
            VideoName: '',
            VideoImage: '',
            Video: '',
            VideoPremium: false,
            CharacterId: '',
        },
        validationSchema: videoSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('VideoName', values.VideoName);
            formData.append('VideoImage', values.VideoImage);
            formData.append('Video', values.Video);
            formData.append('VideoPremium', values.VideoPremium);
            formData.append('CharacterId', values.CharacterId);

            const request = id !== undefined
                ? axios.patch(`http://localhost:5001/api/video/update/${id}`, formData)
                : axios.post('http://localhost:5001/api/video/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Video Image Upload');
                setVideoFileLabel('Video File Upload');
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

    const handleEdit = (video) => {
        formik.setValues({
            VideoName: video.VideoName,
            VideoImage: video.VideoImage,
            Video: video.Video,
            VideoPremium: video.VideoPremium,
            CharacterId: video.CharacterId,
        });
        setId(video._id);
        setImageFileLabel('Video Image Upload');
        setVideoFileLabel('Video File Upload');
        toggleModal('edit');
    };

    const handleDelete = (videoId) => {
        if (window.confirm("Are you sure you want to delete this Video?")) {
            axios.delete(`http://localhost:5001/api/video/delete/${videoId}`)
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
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(data.length / itemsPerPage);

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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "300px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Video Files</h4>
                    <p>Category / Video Management</p>
                </div>
            </div>
            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Video</Button>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Video" : "Add New Video"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Video Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="VideoName"
                                name="VideoName"
                                value={formik.values.VideoName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.VideoName && !!formik.errors.VideoName}
                            />
                            {formik.errors.VideoName && formik.touched.VideoName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.VideoName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{imageFileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="VideoImage"
                                    name="VideoImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("VideoImage", file);
                                        setImageFileLabel(file ? "Video Image uploaded" : "Video Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="VideoImage" className="btn border bg-white mb-0">Select Video Image</label>
                            </div>
                            {formik.errors.VideoImage && formik.touched.VideoImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.VideoImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{videoFileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="Video"
                                    name="Video"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("Video", file);
                                        setVideoFileLabel(file ? "Video File uploaded" : "Video File Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="Video" className="btn border bg-white mb-0">Select Video File</label>
                            </div>
                            {formik.errors.Video && formik.touched.Video && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Video}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="VideoPremium"
                                name="VideoPremium"
                                label="Premium Video"
                                checked={formik.values.VideoPremium}
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
                                    if (character.Category === 'video') {
                                        return (
                                            <option key={character._id} value={character.CharacterId}>
                                                {character.CharacterName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for characters not in the video category
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
                        <th>Video Name</th>
                        <th>Video Image</th>
                        <th>Video File</th>
                        <th>Premium</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((video, index) => (
                            <tr key={video._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{video.VideoName}</td>
                                <td>
                                    <img src={video.VideoImage} alt="video thumbnail" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>
                                    <video controls width="240">
                                        <source src={video.Video} type="video/mp4" />
                                        <track
                                            kind="captions"
                                            src={video.VideoName}
                                            srcLang="en"
                                            label="English"
                                            default
                                        />
                                        Your browser does not support the video element.
                                    </video>

                                </td>
                                <td>{video.VideoPremium ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(video)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(video._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center">No Data Found</td> {/* Ensure the colSpan matches your table structure */}
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

export default Video;