// import React from 'react';
// import './styles/Header.css';  // Import your CSS file for styles
// // Import SVG icon directly as component to avoid lucide-react dependency
// import InfoIcon from './icons/InfoIcon';

// function Header({ showModelInfo, setShowModelInfo }) {
//   return (
//     <header className="bg-blue-600 text-white p-4 shadow-md">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-bold">Marketing Mix Model Analyzer</h1>
//         <button 
//           onClick={() => setShowModelInfo(!showModelInfo)}
//           className="flex items-center space-x-1 p-2 bg-blue-700 rounded hover:bg-blue-800"
//         >
//           <InfoIcon size={18} />
//           <span>Model Info</span>
//         </button>
//       </div>
//     </header>
//   );
// }

// export default Header;

//more questions

import React from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';

function Header({ modelInfo }) {
  return (
    <Box bg="blue.600" color="white" px={8} py={6}>
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="lg">Marketing Mix Model Dashboard</Heading>
          <Text mt={2} fontSize="sm">
            {modelInfo?.type || 'Loading model information...'}
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="sm">Total Sales: ${modelInfo?.total_sales?.toLocaleString() || '0'}</Text>
          <Text fontSize="sm">
            Marketing Contribution: {modelInfo?.marketing_contribution?.percentage?.toFixed(1) || '0'}%
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Header;
