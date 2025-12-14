'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleWrapper({ children }) {
    return (
        <GoogleOAuthProvider clientId="613294454173-3oqebd3fm8m2qker85m5i4142t6ehokh.apps.googleusercontent.com">
            {children}
        </GoogleOAuthProvider>
    );
}