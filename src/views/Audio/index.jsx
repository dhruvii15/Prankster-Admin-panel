import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Col, Row, Spinner, Nav } from 'react-bootstrap';
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

const Audio = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Audio Prank Image Upload');
    const [audioFileLabel, setAudioFileLabel] = useState('Audio Prank File Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImageFileName, setSelectedImageFileName] = useState('');
    const [selectedAudioFileName, setSelectedAudioFileName] = useState('');

    // New state for category and additional filters
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('');

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Audio Prank Image Upload');
                setAudioFileLabel('Audio Prank File Upload');
                setSelectedImageFileName('');
                setSelectedAudioFileName('');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setImageFileLabel('Audio Prank Image Upload');
            setAudioFileLabel('Audio Prank File Upload');
            setSelectedImageFileName('');
            setSelectedAudioFileName('');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/audio/read')
            .then((res) => {
                const newData = res.data.data.reverse();
                setData(newData);
                filterAudioData(newData, activeTab, selectedFilter);
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
                setCategory(res.data.data.filter(cat => cat.Type.includes('audio')));
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

    // Updated filtering function
    const filterAudioData = (dataToFilter, categoryTab, additionalFilter) => {
        let filtered = [...dataToFilter];

        // Filter by category
        if (categoryTab !== 'all') {
            const selectedCategory = category.find(cat => cat.CategoryName.toLowerCase() === categoryTab);
            if (selectedCategory) {
                filtered = filtered.filter(item => item.CategoryId === selectedCategory.CategoryId);
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
                filtered = filtered.filter(item => item.AudioPremium === true);
                break;
            case "Free":
                filtered = filtered.filter(item => item.AudioPremium === false);
                break;
            default:
                break;
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };


    // Update useEffect to handle filtering
    useEffect(() => {
        filterAudioData(data, activeTab, selectedFilter);
    }, [activeTab, selectedFilter, data]);

    const audioSchema = Yup.object().shape({
        AudioName: Yup.string().required('Audio Prank Name is required'),
        Audio: Yup.mixed()
            .test(
                'fileValidation',
                'Only audio files are allowed (e.g., .mp3, .wav)',
                function (value) {
                    if (typeof value === 'string') return true;
                    if (!value) {
                        return this.parent.isEditing ? true : false;
                    }

                    if (value instanceof File) {
                        const allowedExtensions = ['audio/mpeg', 'audio/wav'];
                        return allowedExtensions.includes(value.type);
                    }

                    return false;
                }
            ),
        AudioImage: Yup.mixed()
            .test(
                'fileType',
                'Only image files are allowed (e.g., .jpg, .png, .jpeg)',
                function (value) {
                    if (!value) return true; // Optional field
                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                        return allowedExtensions.includes(value.type);
                    }
                    return true; // For existing files during edit
                }
            ),
        AudioPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        Hide: Yup.boolean(),
        isEditing: Yup.boolean()
    });


    const formik = useFormik({
        initialValues: {
            AudioName: '',
            ArtistName: '',
            Audio: '',
            AudioImage: '',
            AudioPremium: false,
            CategoryId: '',
            Hide: false,
            isEditing: false
        },
        validationSchema: audioSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('AudioName', values.AudioName);
                formData.append('ArtistName', values.ArtistName);
                if (values.Audio instanceof File) {
                    formData.append('Audio', values.Audio);
                }
                if (values.AudioImage instanceof File) {
                    formData.append('AudioImage', values.AudioImage);
                }
                formData.append('AudioPremium', values.AudioPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('Hide', values.Hide);

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/audio/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/audio/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Audio Prank Image Upload');
                setAudioFileLabel('Audio Prank File Upload');
                setSelectedImageFileName('');
                setSelectedAudioFileName('');
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

    const handleEdit = (audio) => {
        const imageFileName = audio.AudioImage.split('/').pop();
        const audioFileName = audio.Audio.split('/').pop();
        setSelectedImageFileName(imageFileName);
        setSelectedAudioFileName(audioFileName);

        formik.setValues({
            AudioName: audio.AudioName,
            ArtistName: audio.ArtistName,
            Audio: '',  // Reset file input
            AudioImage: '', // Reset file input
            AudioPremium: audio.AudioPremium,
            CategoryId: audio.CategoryId,
            Hide: audio.Hide,
            isEditing: true
        });
        setId(audio._id);
        setImageFileLabel('Audio Prank Image Upload');
        setAudioFileLabel('Audio Prank File Upload');
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
        if (window.confirm("Are you sure you want to delete this Audio Prank?")) {
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

    const handleCopyToClipboard = (audio) => {
        if (audio?.Audio) {
            navigator.clipboard.writeText(audio.Audio)
                .then(() => {
                    toast.success("audio URL copied to clipboard!");
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
                    <h4>Audio Prank</h4>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238", color: "black" }}
                >
                    Add Audio Prank
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
                        All ({selectedFilter ? filteredData.length : data.length})
                    </Nav.Link>
                </Nav.Item>
                {category.map((cat) => {
                    // Get count based on current filter and category
                    const categoryData = data.filter(item => item.CategoryId === cat.CategoryId);
                    let count;

                    switch (selectedFilter) {
                        case "Hide":
                            count = categoryData.filter(item => item.Hide).length;
                            break;
                        case "Unhide":
                            count = categoryData.filter(item => !item.Hide).length;
                            break;
                        case "Premium":
                            count = categoryData.filter(item => item.AudioPremium).length;
                            break;
                        case "Free":
                            count = categoryData.filter(item => !item.AudioPremium).length;
                            break;
                        default:
                            count = categoryData.length;
                    }

                    return (
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
                                ({count})
                            </Nav.Link>
                        </Nav.Item>
                    );
                })}
            </Nav>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header >
                    <Modal.Title>{id ? "Edit Audio Prank" : "Add Audio Prank"}</Modal.Title>
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
                                    if (category.Type === 'audio') {
                                        return (
                                            <option key={category._id} value={category.CategoryId}>
                                                {category.CategoryName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for category not in the audio category
                                })}
                            </Form.Control>
                            {formik.errors.CategoryId && formik.touched.CategoryId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryId}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Audio Prank Name ( use searching )<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="AudioName"
                                name="AudioName"
                                className='py-2'
                                placeholder="Enter Audio Prank Name"
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
                            <Form.Label className='fw-bold'>{imageFileLabel}<span style={{ fontSize: "12px" }}></span></Form.Label>
                            <div className="d-flex flex-column">
                                <Form.Control
                                    type="file"
                                    id="AudioImage"
                                    name="AudioImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("AudioImage", file);
                                        if (file) {
                                            setImageFileLabel("Audio Prank Image uploaded");
                                            setSelectedImageFileName(file.name);
                                        } else {
                                            setImageFileLabel("Audio Prank Image Upload");
                                            setSelectedImageFileName('');
                                        }
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="AudioImage" className="btn mb-2 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }}>Select Audio Prank Image</div>
                                    <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                        {selectedImageFileName}
                                    </span>
                                </label>
                            </div>
                            {formik.errors.AudioImage && formik.touched.AudioImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.AudioImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{audioFileLabel}<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex flex-column">
                                <Form.Control
                                    type="file"
                                    id="Audio"
                                    name="Audio"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("Audio", file);
                                        if (file) {
                                            setAudioFileLabel("Audio Prank File uploaded");
                                            setSelectedAudioFileName(file.name);
                                        } else {
                                            setAudioFileLabel("Audio Prank File Upload");
                                            setSelectedAudioFileName('');
                                        }
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="Audio" className="btn mb-2 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }}>Select Audio Prank File</div>
                                    <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                        {selectedAudioFileName}
                                    </span>
                                </label>
                            </div>
                            {formik.errors.Audio && formik.touched.Audio && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Audio}
                                </div>
                            )}
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="AudioPremium"
                                    name="AudioPremium"
                                    label="Premium Audio Prank"
                                    checked={formik.values.AudioPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Hide"
                                    name="Hide"
                                    label="Hide Audio Prank"
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
            </Modal >

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Audio Prank Name</th>
                        <th>Artist Name</th>
                        <th>Audio Prank Image</th>
                        <th>Audio Prank File</th>
                        <th>Category</th>
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
                                <td>{audio.ArtistName}</td>
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
                                <td>{audio.CategoryName}</td>
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
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(audio)} // Use an arrow function to pass the parameter
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(audio)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(audio._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {
                totalPages > 1 && (
                    <div className='d-flex justify-content-center'>
                        <Pagination>
                            {renderPaginationItems()}
                        </Pagination>
                    </div>
                )
            }

            <ToastContainer />
        </div >
    );
};

export default Audio;