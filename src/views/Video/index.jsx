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

const Video = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Video Image Upload');
    const [videoFileLabel, setVideoFileLabel] = useState('Video File Upload');
    const [selectedVideo, setSelectedVideo] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);


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
        axios.post('https://pslink.world/api/video/read')
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
        filterVideoData();
    }, [selectedVideo, data]);

    // Add filtering function
    const filterVideoData = () => {
        let filtered = [...data];

        switch (selectedVideo) {
            case "Hide":
                filtered = data.filter(item => item.Hide === true);
                break;
            case "Unhide":
                filtered = data.filter(item => item.Hide === false);
                break;
            case "Premium":
                filtered = data.filter(item => item.VideoPremium === true);
                break;
            case "Free":
                filtered = data.filter(item => item.VideoPremium === false);
                break;
            default:
                filtered = data;
        }

        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const getCategory = () => {
        axios.post('https://pslink.world/api/category/read')
            .then((res) => {
                setCategory(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch category.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
    }, []);

    const videoSchema = Yup.object().shape({
        VideoName: Yup.string().required('Video Name is required'),
        VideoImage: Yup.mixed().required('Video Image is required'),
        Video: Yup.mixed().required('Video File is required'),
        VideoPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Category Name is required'),
        Hide: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            VideoName: '',
            VideoImage: '',
            Video: '',
            VideoPremium: false,
            CategoryId: '',
            Hide: false,
        },
        validationSchema: videoSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try{
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('VideoName', values.VideoName);
            formData.append('VideoImage', values.VideoImage);
            formData.append('Video', values.Video);
            formData.append('VideoPremium', values.VideoPremium);
            formData.append('CategoryId', values.CategoryId);
            formData.append('Hide', values.Hide);

            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/video/update/${id}`, formData)
                : axios.post('https://pslink.world/api/video/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Video Image Upload');
                setVideoFileLabel('Video File Upload');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const handleEdit = (video) => {
        formik.setValues({
            VideoName: video.VideoName,
            VideoImage: video.VideoImage,
            Video: video.Video,
            VideoPremium: video.VideoPremium,
            CategoryId: video.CategoryId,
            Hide: video.Hide,
        });
        setId(video._id);
        setImageFileLabel('Video Image Upload');
        setVideoFileLabel('Video File Upload');
        toggleModal('edit');
    };

    const handleHideToggle = (videoId, currentHideStatus) => {
        axios.patch(`https://pslink.world/api/video/update/${videoId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handlePremiumToggle = (videoId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/video/update/${videoId}`, { VideoPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (videoId) => {
        if (window.confirm("Are you sure you want to delete this Video?")) {
            axios.delete(`https://pslink.world/api/video/delete/${videoId}`)
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
                    <h4>Video Files</h4>
                    <p>Type / Video Management</p>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#FFD800", color: "black" }}
                >
                    Add New Video
                </Button>
                <Form.Select
                    value={selectedVideo}
                    onChange={(e) => setSelectedVideo(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>
            <Modal 
                show={visible} 
                onHide={() => !isSubmitting && toggleModal('add')} 
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header closeButton={!isSubmitting}>
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
                            <Form.Check
                                type="checkbox"
                                id="Hide"
                                name="Hide"
                                label="Hide video"
                                checked={formik.values.Hide}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                as="select"
                                id="CategoryId"
                                name="CategoryId"
                                value={formik.values.CategoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >
                                <option value="">Select a category</option>
                                {category.map((category) => {
                                    if (category.Type === 'video') {
                                        return (
                                            <option key={category._id} value={category.CategoryId}>
                                                {category.CategoryName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for category not in the video category
                                })}
                            </Form.Control>
                            {formik.errors.CategoryId && formik.touched.CategoryId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryId}
                                </div>
                            )}
                        </Form.Group>

                        <Button  type="submit" className='bg-white border-0' disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
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
                        <th>Hidden</th>
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
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: video.VideoPremium ? "#0385C3" : "#6c757d" }}
                                        onClick={() => handlePremiumToggle(video._id, video.VideoPremium)}
                                    >
                                        <FontAwesomeIcon
                                            icon={video.VideoPremium ? faToggleOn : faToggleOff}
                                            title={video.VideoPremium ? "Premium ON" : "Premium OFF"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleHideToggle(video._id, video.Hide)}>
                                        <FontAwesomeIcon icon={video.Hide ? faEyeSlash : faEye} />
                                    </Button>
                                </td>
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
                            <td colSpan={7} className="text-center">No Data Found</td> {/* Ensure the colSpan matches your table structure */}
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