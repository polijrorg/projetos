'use client'
import { useState, useEffect } from 'react';

import CredentialsLoginForm from '@/components/form/CredentialsLoginForm';

function AdminForm() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  return ( 
    <>
      <h2 className='text-[40px] font-bold'>Entre na sua conta</h2>
      <div className="w-[360px]">
        <CredentialsLoginForm
          callbackUrl="/admin/dashboard"
          loading={loading} setLoading={setLoading}  
          email={email} setEmail={setEmail} 
          password={password} setPassword={setPassword} 
        />
      </div>
    </>
   );
}

export default AdminForm;