import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../firebase/firebase.services';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await loginUser(email, password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8" },
    React.createElement('div', { className: "max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg" },
      React.createElement('div', { className: "text-center" },
        React.createElement('div', { className: "flex justify-center" },
          React.createElement(Leaf, { className: "h-12 w-12 text-green-600" })
        ),
        React.createElement('h2', { className: "mt-4 text-3xl font-extrabold text-gray-900" }, "AgriSync AI"),
        React.createElement('p', { className: "mt-2 text-sm text-gray-600" }, "Carbon-first agriculture platform")
      ),
      React.createElement('form', { className: "mt-8 space-y-6", onSubmit: handleSubmit },
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "Email Address"),
            React.createElement('input', {
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm",
              placeholder: "you@example.com"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "Password"),
            React.createElement('input', {
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm",
              placeholder: "••••••••"
            })
          )
        ),
        React.createElement('div', null,
          React.createElement('button', {
            type: "submit",
            disabled: loading,
            className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          }, loading ? 'Signing in...' : 'Sign in')
        ),
        React.createElement('div', { className: "text-center" },
          React.createElement(Link, { to: "/register", className: "text-sm text-green-600 hover:text-green-500" }, "Don't have an account? Register")
        )
      )
    )
  );
};

export default Login;