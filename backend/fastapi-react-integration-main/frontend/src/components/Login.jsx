import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await login(formData.username, formData.password);
            } catch (error) {
                setErrors({
                    submit: "Invalid username or password"
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginTop: "5px",
                            border: errors.username ? "1px solid red" : "1px solid #ccc"
                        }}
                    />
                    {errors.username && <p style={{ color: 'red', margin: "5px 0" }}>{errors.username}</p>}
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginTop: "5px",
                            border: errors.password ? "1px solid red" : "1px solid #ccc"
                        }}
                    />
                    {errors.password && <p style={{ color: 'red', margin: "5px 0" }}>{errors.password}</p>}
                </div>

                {errors.submit && <p style={{ color: 'red', margin: "10px 0" }}>{errors.submit}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "10px 15px",
                        border: "none",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
