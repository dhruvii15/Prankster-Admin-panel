import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.svg";

const CoverURL = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const categories = ['emoji', 'realistic'];
    const [fileLabel, setFileLabel] = useState('Cover Image Upload');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [emojiPage, setEmojiPage] = useState(1);
    const [realisticPage, setRealisticPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const itemsPerPage = 10;
    const [selectedFilter, setSelectedFilter] = useState("");

    const toggleModal = (mode) => {
        if (mode === 'add') {
            setId(undefined);
            setIsEditing(false);
            setFileLabel('Cover Image Upload');
            setSelectedFiles([]);
            setPreviewUrls([]);
        }
        setVisible(!visible);
    };

    useEffect(() => {
        if (!visible) {
            formik.resetForm();
            setSelectedFiles([]);
            setPreviewUrls([]);
            setFileLabel('Cover Image Upload');
            setIsEditing(false);
        }
    }, [visible]);

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5000/api/cover/read')
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


    const filterData = (covers) => {
        switch (selectedFilter) {
            case "Hide":
                return covers.filter(cover => cover.Hide === true);
            case "Unhide":
                return covers.filter(cover => cover.Hide === false);
            case "Premium":
                return covers.filter(cover => cover.CoverPremium === true);
            case "Free":
                return covers.filter(cover => cover.CoverPremium === false);
            default:
                return covers;
        }
    };

    const groupByCategory = (category) => {
        const filteredData = filterData(data);
        return filteredData.filter(cover => cover.Category === category);
    };

    const coverSchema = Yup.object().shape({
        Category: Yup.string().required('Category is required'),
        CoverPremium: Yup.boolean(),
        Hide: Yup.boolean(), // Add Hide field to schema
    });

    const formik = useFormik({
        initialValues: {
            Category: '',
            CoverPremium: false,
            Hide: false, // Add Hide field to initial values
        },
        validationSchema: coverSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const formData = new FormData();
                
                if (!isEditing && selectedFiles.length === 0) {
                    toast.error("Please select at least one image");
                    return;
                }

                if (selectedFiles.length > 0) {
                    selectedFiles.forEach((file) => {
                        formData.append('CoverURL', file);
                    });
                }
                
                formData.append('Category', values.Category);
                formData.append('CoverPremium', values.CoverPremium);
                formData.append('Hide', values.Hide); // Add Hide field to formData

                let response;
                if (isEditing) {
                    response = await axios.patch(
                        `http://localhost:5000/api/cover/update/${id}`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                } else {
                    response = await axios.post(
                        'http://localhost:5000/api/cover/create',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }

                toast.success(response.data.message);
                resetForm();
                setSelectedFiles([]);
                setPreviewUrls([]);
                setId(undefined);
                setIsEditing(false);
                setFileLabel('Cover Image Upload');
                getData();
                toggleModal();
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleHideToggle = (coverId, currentHideStatus) => {
        axios.patch(`http://localhost:5000/api/cover/update/${coverId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handlePremiumToggle = (coverId, currentPremiumStatus) => {
        axios.patch(`http://localhost:5000/api/cover/update/${coverId}`, { CoverPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.currentTarget.files);
        
        if (files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        setSelectedFiles(files);
        setFileLabel(`${files.length} file(s) selected`);
    };

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleEdit = (cover) => {
        setIsEditing(true);
        setId(cover._id);
        
        if (cover.CoverURL) {
            setPreviewUrls([cover.CoverURL]);
        }
        
        formik.setValues({
            Category: cover.Category || '',
            CoverPremium: cover.CoverPremium || false,
            Hide: cover.Hide || false, // Add Hide field when editing
        });

        setFileLabel('Update Cover Image (Optional)');
        toggleModal('edit');
    };

    const handleDelete = (coverId) => {
        if (window.confirm("Are you sure you want to delete this Cover Image?")) {
            axios.delete(`http://localhost:5000/api/cover/delete/${coverId}`)
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
                    <h4>Cover Image</h4>
                    <p>Utilities / CoverImage</p>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Button 
                    onClick={() => toggleModal('add')} 
                    className='my-4 rounded-3 border-0' 
                    style={{ backgroundColor: "#FFD800" }}
                >
                    Add New CoverImage
                </Button>
                <Form.Select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)} 
                    style={{ width: 'auto' }} 
                    className='my-4'
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>
            <Modal show={visible} onHide={() => toggleModal()} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Cover Image" : "Add New Cover Image"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        id="CoverURL"
                                        name="CoverURL"
                                        multiple={!isEditing}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="d-none"
                                    />
                                    <label htmlFor="CoverURL" className="btn border bg-white mb-0">
                                        {isEditing ? "Select New Image" : "Select Images (Max 5)"}
                                    </label>
                                </div>
                                
                                {/* Preview section */}
                                {previewUrls.length > 0 && (
                                    <div className="mt-3 d-flex flex-wrap gap-2">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="position-relative">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                id="Category"
                                name="Category"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.Category}
                            >
                                <option value="">Select Category</option>
                                <option value="emoji">Emoji</option>
                                <option value="realistic">Realistic</option>
                            </Form.Select>
                            {formik.errors.Category && formik.touched.Category && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Category}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="CoverPremium"
                                name="CoverPremium"
                                label="Premium Cover"
                                checked={formik.values.CoverPremium}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="Hide"
                                name="Hide"
                                label="Hide Cover"
                                checked={formik.values.Hide}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Button 
                            type="submit" 
                            className='bg-white border-0' 
                            disabled={formik.isSubmitting || (!isEditing && selectedFiles.length === 0)}
                        >
                            {formik.isSubmitting ? 'Submitting...' : (isEditing ? 'Update' : 'Submit')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {categories.map((category) => {
                const categoryData = groupByCategory(category);
                const currentPage = category === 'emoji' ? emojiPage : realisticPage;
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = categoryData.slice(indexOfFirstItem, indexOfLastItem);

                return (
                    <div key={category}>
                        <h5 className='py-3'>{category === 'emoji' ? 'Emoji' : 'Realistic'} Category:</h5>
                        <Table striped bordered hover responsive className='text-center fs-6'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Cover</th>
                                    <th>Premium</th>
                                    <th>Hidden</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((cover, index) => (
                                    <tr key={cover._id}>
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <img 
                                                src={cover.CoverURL} 
                                                alt={'CoverImage'} 
                                                style={{ width: '150px', height: '120px', objectFit: 'cover' }} 
                                            />
                                        </td>
                                        <td>
                                            <Button 
                                                className='bg-transparent border-0 fs-4' 
                                                style={{ color: cover.CoverPremium ? "#0385C3" : "#6c757d" }}
                                                onClick={() => handlePremiumToggle(cover._id, cover.CoverPremium)}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={cover.CoverPremium ? faToggleOn : faToggleOff} 
                                                    title={cover.CoverPremium ? "Premium ON" : "Premium OFF"}
                                                />
                                            </Button>
                                        </td>
                                        <td>
                                            <Button 
                                                className='bg-transparent border-0 fs-5' 
                                                style={{ color: "#0385C3" }} 
                                                onClick={() => handleHideToggle(cover._id, cover.Hide)}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={cover.Hide ? faEyeSlash : faEye}
                                                    title={cover.Hide ? "Hidden" : "Visible"}
                                                />
                                            </Button>
                                        </td>
                                        <td>
                                            <Button 
                                                className='bg-transparent border-0 fs-5' 
                                                style={{ color: "#0385C3" }} 
                                                onClick={() => handleEdit(cover)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button 
                                                className='bg-transparent border-0 text-danger fs-5' 
                                                onClick={() => handleDelete(cover._id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {Math.ceil(categoryData.length / itemsPerPage) > 1 && (
                            <div className='d-flex justify-content-center'>
                                <Pagination>
                                    {Array.from({ length: Math.ceil(categoryData.length / itemsPerPage) }).map((_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={index + 1 === currentPage}
                                            onClick={() => category === 'emoji' 
                                                ? setEmojiPage(index + 1) 
                                                : setRealisticPage(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            </div>
                        )}
                    </div>
                );
            })}

            <ToastContainer />
        </div>
    );
};

export default CoverURL;