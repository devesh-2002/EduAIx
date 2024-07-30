import React, { useState } from 'react';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from "firebase/auth";
import { Button, Center, Heading, VStack, Text, Avatar } from '@chakra-ui/react';
import UploadForm from './UploadForm';
function StudentAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(`User signed in: ${result.user.displayName}`);
      setName(result.user.displayName);
      setPhotoURL(result.user.photoURL); 
      setIsAuth(true);
    } catch (error) {
      console.error(`Error during sign in: ${error.message}`);
    }
  };

  return (
    <Center>
      <VStack spacing={4} mt={8}>
        {!isAuth && 
        (
          <>
            <Heading as="h2" size="lg">Student Authentication</Heading>

          <Button
            onClick={handleSignIn}
            bg="white"
            color="gray.800"
            _hover={{ bg: "gray.100" }}
            _active={{ bg: "gray.200", transform: "scale(0.98)" }}
            boxShadow="md"
            borderRadius="md"
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <img
              src="https://image.similarpng.com/very-thumbnail/2020/06/Logo-google-icon-PNG.png"
              alt="Google Logo"
              height="12px"
              width="12px"
              style={{ marginRight: '12px' }}
            />
            Sign in with Google
          </Button></>
        )}
        {isAuth && (
          <>
          <VStack spacing={2} alignItems="center">
            <Avatar src={photoURL} size="md" />
            <Text fontSize="xl">Welcome, {name}</Text>
          </VStack>
          <UploadForm />
</>
        )}
        
      </VStack>
    </Center>
  );
}

export default StudentAuth;
