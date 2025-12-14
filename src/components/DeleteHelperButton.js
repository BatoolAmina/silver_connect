'use client';

import { useRouter } from 'next/navigation';

export default function DeleteHelperButton({ helperId }) {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this helper?');

        if (confirmed) {
            const res = await fetch(`${API_BASE_URL}/api/helpers/${helperId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                alert('Failed to delete helper.');
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="mt-6 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700"
        >
            Delete Helper
        </button>
    );
}