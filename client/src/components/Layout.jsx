// src/components/Layout.jsx
import React from 'react';
import { Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Flex direction="column" minHeight="100vh">
      <Navbar />
      <Flex as="main" flex="1" px={8} py={4}>
        {children}
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Layout;
