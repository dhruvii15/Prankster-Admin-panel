import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Row, Col, Spinner, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const Video = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [videoFileLabel, setVideoFileLabel] = useState('Video Prank File Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedVideoFileName, setSelectedVideoFileName] = useState("");
    const [currentVideoFileName, setCurrentVideoFileName] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('');

    // New state variables for safe/unsafe functionality
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);

    const getAdminData = () => {
        axios.get('https://pslink.world/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].VideoSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    // Modified handleToggle function for safe/unsafe
    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                // Call the appropriate API based on the state
                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`https://pslink.world/api/${apiEndpoint}/${adminId}`, { type: "2" });

                // Reset to first page when toggling safe mode
                setCurrentPage(1);

                // Fetch updated data
                getData();
                getAdminData();

                toast.success(response.data.message);
            } catch (error) {
                console.error('Error updating safe status:', error);
                toast.error("Failed to update safe status.");
                setIsOn(!newState); // Revert to previous state on error
            } finally {
                setIsSubmitting2(false);
            }
        }
    };

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setVideoFileLabel('Video Prank File Upload');
                setSelectedVideoFileName('');
                setCurrentVideoFileName('');
                const fileInput = document.getElementById('Video');
                if (fileInput) {
                    fileInput.value = '';
                }
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setVideoFileLabel('Video Prank File Upload');
            setSelectedVideoFileName('');
            setCurrentVideoFileName('');
            const fileInput = document.getElementById('Video');
            if (fileInput) {
                fileInput.value = '';
            }
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/video/read')
            .then((res) => {
                const newData = res.data.data.reverse();
                setData(newData);
                // Remove the filterVideoData call here
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const getCategory = () => {
        axios.post('https://pslink.world/api/category/read')
            .then((res) => {
                setCategory(res.data.data.filter(cat => cat.Type.includes('video')));
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch category.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
        getAdminData();
    }, []);


    const getFilteredCount = (categoryId = null, filterType = '') => {
        if (!data || data.length === 0) return 0;
        
        // First filter by safe/unsafe status
        let filtered = data.filter(item => item.Unsafe === !isOn);

        // Then apply category filter if specified
        if (categoryId) {
            filtered = filtered.filter(item => item.CategoryId === categoryId);
        }

        // Finally apply additional filters
        switch (filterType) {
            case "Hide":
                return filtered.filter(item => item.Hide).length;
            case "Unhide":
                return filtered.filter(item => !item.Hide).length;
            case "Premium":
                return filtered.filter(item => item.VideoPremium).length;
            case "Free":
                return filtered.filter(item => !item.VideoPremium).length;
            default:
                return filtered.length;
        }
    };

    // Updated filtering function
    const filterVideoData = (dataToFilter, categoryTab, additionalFilter) => {
        if (!dataToFilter || dataToFilter.length === 0) return [];
        
        // First filter by unsafe status
        let filtered = dataToFilter.filter(item => item.Unsafe === !isOn);

        // Then filter by category
        if (categoryTab !== 'all') {
            const selectedCategory = category.find(cat => 
                cat.CategoryName.toLowerCase() === categoryTab
            );
            if (selectedCategory) {
                filtered = filtered.filter(item => 
                    item.CategoryId === selectedCategory.CategoryId
                );
            }
        }

        // Apply additional filters
        switch (additionalFilter) {
            case "Hide":
                filtered = filtered.filter(item => item.Hide === true);
                break;
            case "Unhide":
                filtered = filtered.filter(item => item.Hide === false);
                break;
            case "Premium":
                filtered = filtered.filter(item => item.VideoPremium === true);
                break;
            case "Free":
                filtered = filtered.filter(item => item.VideoPremium === false);
                break;
            default:
                break;
        }

        return filtered;
    };

    // Update useEffect to handle filtering
    useEffect(() => {
        if (data.length > 0) {
            const filtered = filterVideoData(data, activeTab, selectedFilter);
            setFilteredData(filtered);
        }
    }, [data, activeTab, selectedFilter, isOn, category]);


    const videoSchema = Yup.object().shape({
        VideoName: Yup.string().required('Video Prank Name is required'),
        Video: Yup.mixed()
            .test(
                'fileValidation',
                'Only video files are allowed (e.g., .mp4, .mkv, .avi)',
                function (value) {
                    // If editing and no new file is selected, skip validation
                    if (typeof value === 'string') return true;

                    // For new entries or when a new file is selected during edit
                    if (!value) {
                        // Required only for new entries
                        return this.parent.isEditing ? true : false;
                    }

                    // Validate file type if a file is provided
                    if (value instanceof File) {
                        const allowedExtensions = [
                            'video/mp4',
                            'video/x-matroska', // for .mkv
                            'video/x-msvideo', // for .avi
                        ];
                        return allowedExtensions.includes(value.type);
                    }

                    return false;
                }
            ),
        VideoPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        Hide: Yup.boolean(),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            VideoName: '',
            ArtistName: '',
            Video: '',
            VideoPremium: false,
            CategoryId: '',
            Hide: false,
            isEditing: false,
            Unsafe: true // Add Unsafe field
        },
        validationSchema: videoSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('VideoName', values.VideoName);
                formData.append('ArtistName', values.ArtistName);
                if (values.Video instanceof File) {
                    formData.append('Video', values.Video);
                }
                formData.append('VideoPremium', values.VideoPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('Hide', values.Hide);
                formData.append('Unsafe', "true"); // Add Unsafe field

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/video/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/video/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setVideoFileLabel('Video Prank File Upload');
                setSelectedVideoFileName('');
                setCurrentVideoFileName('');
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
        const videoFileName = video.Video.split('/').pop();
        setCurrentVideoFileName(videoFileName);
        setSelectedVideoFileName('');
        setVideoFileLabel('Video Prank File Upload');

        formik.setValues({
            VideoName: video.VideoName,
            ArtistName: video.ArtistName,
            Video: video.Video,
            VideoPremium: video.VideoPremium,
            CategoryId: video.CategoryId,
            Hide: video.Hide,
            isEditing: true
        });
        setId(video._id);
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
        if (window.confirm("Are you sure you want to delete this Video Prank?")) {
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

    const handleCopyToClipboard = (video) => {
        if (video?.Video) {
            navigator.clipboard.writeText(video.Video)
                .then(() => {
                    toast.success("video URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Video Prank</h4>
                </div>
                <Form className='d-flex align-items-center gap-3'>
                    <span>Safe : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting2}
                    />
                </Form>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238", color: "black" }}
                >
                    Add Video Prank
                </Button>
                <Form.Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>

            {/* Category Tabs Navigation */}
            <Nav variant="tabs" className="pt-4">
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === 'all'}
                        className={activeTab === 'all' ? 'active-tab' : ''}
                        onClick={() => {
                            setActiveTab('all');
                            setCurrentPage(1);
                        }}
                    >
                        All ({getFilteredCount(null, selectedFilter)})
                    </Nav.Link>
                </Nav.Item>
                {category.map((cat) => (
                    <Nav.Item key={cat._id}>
                        <Nav.Link
                            active={activeTab === cat.CategoryName.toLowerCase()}
                            className={activeTab === cat.CategoryName.toLowerCase() ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab(cat.CategoryName.toLowerCase());
                                setCurrentPage(1);
                            }}
                        >
                            <span className="pe-2">{cat.CategoryName}</span>
                            ({getFilteredCount(cat.CategoryId, selectedFilter)})
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Video Prank" : "Add Video Prank"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Category Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="CategoryId"
                                name="CategoryId"
                                className='py-2'
                                value={formik.values.CategoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >
                                <option value="">Select a Prank Category</option>
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

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Video Prank Name ( use searching )<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="VideoName"
                                name="VideoName"
                                className='py-2'
                                placeholder="Enter Video Prank Name"
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
                            <Form.Label className='fw-bold'>Artist Name ( use searching )</Form.Label>
                            <Form.Control
                                type="text"
                                id="ArtistName"
                                name="ArtistName"
                                className='py-2'
                                placeholder="Enter ArtistName"
                                value={formik.values.ArtistName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.ArtistName && !!formik.errors.ArtistName}
                            />
                            {formik.errors.ArtistName && formik.touched.ArtistName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.ArtistName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{videoFileLabel}<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        id="Video"
                                        name="Video"
                                        onChange={(event) => {
                                            let file = event.currentTarget.files[0];
                                            formik.setFieldValue("Video", file);
                                            if (file) {
                                                setVideoFileLabel("Audio Prank Image uploaded");
                                                setCurrentVideoFileName(file.name);
                                            } else {
                                                setVideoFileLabel("Audio Prank Image Upload");
                                                setCurrentVideoFileName('');
                                            }
                                            setSelectedVideoFileName(file ? file.name : "");
                                        }}
                                        onBlur={formik.handleBlur}
                                        label="Choose File"
                                        className="d-none"
                                        custom
                                    />
                                    <label htmlFor="Video" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                        <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                        <div style={{ color: "#c1c1c1" }}>Select Video Prank File</div>
                                        <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                            {currentVideoFileName ? currentVideoFileName : selectedVideoFileName}
                                        </span>
                                    </label>
                                </div>
                            </div>
                            {formik.errors.Video && formik.touched.Video && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Video}
                                </div>
                            )}
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="VideoPremium"
                                    name="VideoPremium"
                                    label="Premium Video Prank"
                                    checked={formik.values.VideoPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Hide"
                                    name="Hide"
                                    label="Hide Video Prank"
                                    checked={formik.values.Hide}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </div>

                        <Row className="mt-2">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleModal()}
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size='sm' /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>

                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Video Prank Name</th>
                        <th>Artist Name</th>
                        <th>Video Prank File</th>
                        <th>Prank Category</th>
                        <th>Premium</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((video, index) => (
                            <tr key={video._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td style={{
                                    backgroundColor: video.Hide ? '#ffcccc' : ''
                                }}>{indexOfFirstItem + index + 1}</td>
                                <td>{video.VideoName}</td>
                                <td>{video.ArtistName}</td>
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
                                <td>{video.CategoryName}</td>
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
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(video)} // Use an arrow function to pass the parameter
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(video)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(video._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center">No Data Found</td> {/* Ensure the colSpan matches your table structure */}
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