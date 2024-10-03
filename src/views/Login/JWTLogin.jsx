import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';
import FullPageLoader from 'components/Loader'; // Assuming this is your custom loader component
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icons for show/hide password

const JWTLogin = () => {
    const [loading, setLoading] = useState(false); // State to control the loader display
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Formik
                initialValues={{
                    email: '',
                    pass: '',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Must be a valid email').required('Email is required'),
                    pass: Yup.string().required('Password is required')
                })}
                onSubmit={async (values, { setErrors, setSubmitting }) => {
                    setLoading(true); // Set loading to true when submitting starts
                    try {
                        const response = await axios.post('http://localhost:5001/api/admin/login', {
                            email: values.email,
                            pass: values.pass
                        });

                        const { token } = response.data;
                        localStorage.setItem('adminToken', token);
                        navigate('/dashboard');
                    } catch (error) {
                        console.error(error);
                        setErrors({ submit: 'Invalid email or password' });
                    }
                    setLoading(false); // Set loading to false when submitting completes
                    setSubmitting(false);
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <input
                                className="form-control"
                                name="email"
                                placeholder='Enter Your Email'
                                onBlur={handleBlur}
                                onChange={handleChange}
                                type="email"
                                value={values.email}
                            />
                            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
                        </div>
                        <div className="form-group mb-4">
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    name="pass"
                                    placeholder='Enter Password'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                    value={values.pass}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                    </button>
                                </div>
                            </div>
                            {touched.pass && errors.pass && <small className="text-danger form-text">{errors.pass}</small>}
                        </div>

                       

                        {errors.submit && (
                            <Col sm={12}>
                                <Alert variant="danger">{errors.submit}</Alert>
                            </Col>
                        )}

                        <Row>
                            <Col mt={2}>
                                <Button
                                    className="btn-block mb-4 px-4 border-0"
                                    disabled={isSubmitting}
                                    size="large"
                                    type="submit"
                                    style={{background : "#FFD800"}}
                                >
                                    {isSubmitting ? (
                                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                                    ) : null}
                                    Sign In
                                </Button>
                            </Col>
                        </Row>

                        {loading && <FullPageLoader />} {/* Render Loader when loading state is true */}
                    </form>
                )}
            </Formik>
        </>
    );
};

export default JWTLogin;
