import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  HStack,
  Stack,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import ColorModeToggle from './colorMode';

const Links = ['Home', 'Student', 'Teacher', 'Contact Us'];

const NavLink = ({ children }) => {
  const to = children === 'Home' ? '/' : `/${children.toLowerCase()}`;

  return (
    <Box
      as={Link}
      to={to}
      px={4}
      py={2}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Box>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'center'} direction="column">
        <Flex alignItems={'center'} justifyContent={'space-between'} w="full">
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <Flex alignItems={'center'} justifyContent={'center'} flex="1">
            <HStack spacing={8} alignItems={'center'}>
              <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                {Links.map((link) => (
                  <NavLink key={link}>{link}</NavLink>
                ))}
                <ColorModeToggle />
              </HStack>
            </HStack>
          </Flex>
          <Flex alignItems={'center'} display={{ base: 'none', md: 'flex' }}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              ></MenuButton>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4} alignItems={'center'}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Flex>
    </Box>
  );
}
