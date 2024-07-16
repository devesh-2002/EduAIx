import { Flex, Link, Text, IconButton, Box } from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <Flex
      as="footer"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      p={3}
      bg="gray.500"
      color="white"
      position="fixed" 
      bottom={0}        
      left={0}         
      right={0}         
      zIndex={5}       
    >
      <Box>
        <Text fontSize="sm">&copy; Made by Devesh Rahatekar.</Text>
      </Box>
      <Box>
        <Link href="https://github.com" isExternal mx={2}>
          <IconButton
            aria-label="GitHub"
            icon={<FaGithub />}
            variant="ghost"
            fontSize="20px"
            color="white"
            _hover={{ color: 'gray.400' }}
          />
        </Link>
        <Link href="https://twitter.com" isExternal mx={2}>
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter />}
            variant="ghost"
            fontSize="20px"
            color="white"
            _hover={{ color: 'blue.400' }}
          />
        </Link>
        <Link href="https://linkedin.com" isExternal mx={2}>
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            variant="ghost"
            fontSize="20px"
            color="white"
            _hover={{ color: 'blue.400' }}
          />
        </Link>
      </Box>
    </Flex>
  );
};

export default Footer;
