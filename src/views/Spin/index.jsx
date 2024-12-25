import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Nav, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.svg";

const Spin = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [coverImageLabel, setCoverImageLabel] = useState('Cover Image Upload');
    const [ImageLabel, setImageLabel] = useState('Prank Image Upload');
    const [fileLabel, setFileLabel] = useState('Prank Upload');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedCoverImageName, setSelectedCoverImageName] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');
    const [activeTab, setActiveTab] = useState('audio');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentImageFileName, setCurrentImageFileName] = useState('');
    const [currentImage2FileName, setCurrentImage2FileName] = useState('');
    const [currentFileFileName, setCurrentFileFileName] = useState('');


    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setCoverImageLabel('Cover Image Upload');
                setImageLabel('Prank Image Upload');
                setFileLabel('Prank Upload');
                setCurrentImageFileName('');
                setCurrentImage2FileName('');
                setCurrentFileFileName('');
                setSelectedFileName('');
                setSelectedCoverImageName('');
                setSelectedImageName('');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setCoverImageLabel('Cover Image Upload');
            setImageLabel('Prank Image Upload');
            setFileLabel('Prank Upload');
            setCurrentImageFileName('');
            setCurrentImage2FileName('');
            setCurrentFileFileName('');
            setSelectedFileName('');
            setSelectedCoverImageName('');
            setSelectedImageName('');
        }
        setVisible(!visible);
    };

    // Get filtered data based on active tab
    const getFilteredData = () => {
        return data.filter(item => item.Type.toLowerCase() === activeTab.toLowerCase());
    };

    const getTypeCount = (type) => {
        return data.filter(item => item.Type.toLowerCase() === type.toLowerCase()).length;
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/admin/spin/read')
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

    useEffect(() => {
        getData();
    }, []);

    const spinSchema = Yup.object().shape({
        Name: Yup.string().required('Name is required'),
        CoverImage: Yup.mixed().required('Cover Image is required').test(
            'fileValidation',
            'Only image files are allowed (e.g., .jpg, .png, .jpeg)',
            function (value) {
                if (typeof value === 'string') return true;
                if (!value) {
                    // Required only for new entries
                    return this.parent.isEditing ? true : false;
                }
                if (value instanceof File) {
                    const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                    return allowedExtensions.includes(value.type);
                }
                return false; // Invalid if no value or not a file
            }
        ),
        Image: Yup.mixed().required('Prank Image is required').test(
            'fileValidation',
            'Only image files are allowed (e.g., .jpg, .png, .jpeg)',
            function (value) {
                if (typeof value === 'string') return true;
                if (!value) {
                    // Required only for new entries
                    return this.parent.isEditing ? true : false;
                }
                if (value instanceof File) {
                    const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                    return allowedExtensions.includes(value.type);
                }
                return false; // Invalid if no value or not a file
            }
        ),
        File: Yup.mixed().required('File is required'),
        Type: Yup.string().required('Type is required'),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            Name: '',
            CoverImage: '',
            Image: '',
            File: '',
            Type: '',
            isEditing: false
        },
        validationSchema: spinSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('Name', values.Name);
                if (values.CoverImage instanceof File) {
                    formData.append('CoverImage', values.CoverImage);
                }
                if (values.Image instanceof File) {
                    formData.append('Image', values.Image);
                }
                formData.append('File', values.File);
                formData.append('Type', values.Type);

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/admin/spin/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/admin/spin/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setCoverImageLabel('Cover Image Upload');
                setImageLabel('Prank Image Upload');
                setFileLabel('Prank Upload');
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

    const handleEdit = (spin) => {
        const imageFileName = spin.CoverImage.split('/').pop();
        const image2FileName = spin.Image.split('/').pop();
        const fileFileName = spin.File.split('/').pop();
        setCurrentImageFileName(imageFileName);
        setCurrentImage2FileName(image2FileName);
        setCurrentFileFileName(fileFileName);
        setCoverImageLabel('Cover Image Upload');
        setImageLabel('Prank Image Upload');
        setFileLabel('Prank Upload');
        setSelectedFileName('');
        setSelectedCoverImageName('');
        setSelectedImageName('');

        formik.setValues({
            Name: spin.Name,
            CoverImage: spin.CoverImage,
            Image: spin.Image,
            File: spin.File,
            Type: spin.Type,
            isEditing: true
        });
        setId(spin._id);
        toggleModal('edit');
    };

    const handleDelete = (spinId) => {
        if (window.confirm("Are you sure you want to delete this Spin?")) {
            axios.delete(`https://pslink.world/api/admin/spin/delete/${spinId}`)
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

    const filteredItems = getFilteredData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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

    const MediaDisplay = ({ type, file, name }) => {
        switch (type.toLowerCase()) {
            case 'audio':
                return (
                    <audio controls>
                        <source src={file} type="audio/mpeg" />
                        <track
                            kind="captions"
                            src={name}
                            srcLang="en"
                            label="English"
                            default
                        />
                        Your browser does not support the audio element.
                    </audio>
                );
            case 'video':
                return (
                    <video controls width="240">
                        <source src={file} type="video/mp4" />
                        <track
                            kind="captions"
                            src={name}
                            srcLang="en"
                            label="English"
                            default
                        />
                        Your browser does not support the video element.
                    </video>
                );
            case 'gallery':
                return (
                    <img src={file} alt="gallery thumbnail" style={{ width: '100px', height: '100px' }} />
                );
            default:
                return <span>{file}</span>;
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: "hidden" }}>
                <img src={logo} alt='loading....' style={{ animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px" }} />
            </div>
        );
    }

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Prank Management</h4>
                </div>
            </div>

            <Button
                onClick={() => toggleModal('add')}
                className="rounded-3 border-0 my-4"
                style={{ backgroundColor: "#F9E238", color: "black" }}
            >
                Add Prank
            </Button>

            <div className="d-flex justify-content-between align-items-sm-center flex-column-reverse flex-sm-row">

                {/* Tabs Navigation */}
                <Nav variant="tabs" className="my-2">
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'audio'}
                            className={activeTab === 'audio' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('audio');
                                setCurrentPage(1);
                            }}
                        >
                            Audio ({getTypeCount('audio')})
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'video'}
                            className={activeTab === 'video' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('video');
                                setCurrentPage(1);
                            }}
                        >
                            Video ({getTypeCount('video')})
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'gallery'}
                            className={activeTab === 'gallery' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('gallery');
                                setCurrentPage(1);
                            }}
                        >
                            Gallery ({getTypeCount('gallery')})
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>


            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header >
                    <Modal.Title>{id ? "Edit Prank" : "Add Prank"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Type<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="Type"
                                name="Type"
                                className='py-2'
                                value={formik.values.Type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.Type && !!formik.errors.Type}
                            >
                                <option value="">Select Type</option>
                                <option value="audio">Audio</option>
                                <option value="video">Video</option>
                                <option value="gallery">Gallery</option>
                            </Form.Control>
                            {formik.errors.Type && formik.touched.Type && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Type}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="Name"
                                name="Name"
                                className='py-2'
                                placeholder="Enter Name"
                                value={formik.values.Name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.Name && !!formik.errors.Name}
                            />
                            {formik.errors.Name && formik.touched.Name && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Name}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{coverImageLabel} <span className='ps-2' style={{ fontSize: "12px" }}></span>
                                <span className='text-danger fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="CoverImage"
                                    name="CoverImage"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("CoverImage", file);
                                        setCoverImageLabel("Cover Image Upload");
                                        setSelectedCoverImageName(file ? file.name : '');
                                        setCurrentImageFileName(''); // Clear current filename when new file is selected
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="CoverImage" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }} className='pt-1'>Select Cover Image</div>
                                    <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                        {selectedCoverImageName || currentImageFileName || 'No file selected'}
                                    </span>
                                </label>
                            </div>
                            {formik.errors.CoverImage && formik.touched.CoverImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CoverImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{ImageLabel} <span className='ps-2' style={{ fontSize: "12px" }}></span>
                                <span className='text-danger fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="Image"
                                    name="Image"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("Image", file);
                                        setImageLabel("Prank Image Upload");
                                        setSelectedImageName(file ? file.name : '');
                                        setCurrentImage2FileName(''); // Clear current filename when new file is selected
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="Image" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }} className='pt-1'>Select Prank Image</div>
                                    <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                        {selectedImageName || currentImage2FileName || 'No file selected'}
                                    </span>
                                </label>
                            </div>
                            {formik.errors.Image && formik.touched.Image && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Image}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{fileLabel}<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="File"
                                    name="File"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("File", file);
                                        setFileLabel("Prank Upload");
                                        setSelectedFileName(file ? file.name : '');
                                        setCurrentFileFileName(''); // Clear current filename when new file is selected
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="File" className="btn mb-0 pt-3 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }} className='pt-1'>Select File </div>
                                    <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                        {selectedFileName || currentFileFileName || 'Audio, Video & Gallery File'}
                                    </span>
                                </label>
                            </div>
                            {formik.errors.File && formik.touched.File && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.File}
                                </div>
                            )}
                        </Form.Group>

                        <Row className="mt-4">
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
                        <th>Name</th>
                        <th>Cover Image</th>
                        <th>Prank Image</th>
                        <th>File</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((spin, index) => (
                            <tr key={spin._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{spin.Name}</td>
                                <td>
                                    <img src={spin.CoverImage} alt="cover" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>
                                    <img src={spin.Image} alt="cover" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>
                                    <MediaDisplay type={spin.Type} file={spin.File} name={spin.Name} />
                                </td>
                                <td>{spin.Type}</td>
                                <td>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(spin)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(spin._id)}>
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

export default Spin;