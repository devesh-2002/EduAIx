import React, { useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import QuestionForm from './QuestionGenerator';
function TeacherAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (email === 'teacher@example.com' && password === 'password') {
      const name = prompt("Enter your name:");
      if (name) {
        setTeacherName(name);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('Please enter a valid name.');
        setIsAuthenticated(false);
      }
    } else {
      setError('Invalid email or password');
      setIsAuthenticated(false);
    }
  };

  const handleSignOut = () => {
    setTeacherName('');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError(null);
  };

  if (isAuthenticated) {
    return (
      <>
      <VStack spacing={4} mt={8}>
        <Heading as="h2" size="lg">Welcome, {teacherName}</Heading>
        <Button onClick={handleSignOut} colorScheme="red">Sign out</Button>
      </VStack>
      <QuestionForm /> 
      </>
    );
  }

  return (
    <Flex align="center" justify="center" height="100vh">
      <Box p={8} maxW="400px" borderWidth={1} borderRadius={10} boxShadow="lg">
        <form onSubmit={handleSignIn}>
          <VStack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>
            <Button type="submit" colorScheme="blue">Sign In</Button>
            {error && <Text color="red.500">{error}</Text>}
            
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}

export default TeacherAuth;
