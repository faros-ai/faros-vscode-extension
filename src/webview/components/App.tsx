import { ChakraProvider, Text } from '@chakra-ui/react';
import * as React from 'react';
import { calculateAutoCompletionStats, getTopRepositories } from '../../stats';

// interface vscode {
//   postMessage(message: any): void;
// }
// declare const vscode: vscode;

// const sendMessage = () => {
//   console.log('button clicked');
//   vscode.postMessage({ command: 'testing' });
// };

const App = () => {  
    const stats = calculateAutoCompletionStats();
    const topRepositories = getTopRepositories(5);
    return (
        <ChakraProvider>
            <Text color="white" fontSize='xl'>Auto-completion events</Text>
            <Text color="white">Today: {stats.today.count} ({stats.today.timeSaved.toFixed(2)} min saved)</Text>
            <Text color="white">This week: {stats.thisWeek.count} ({stats.thisWeek.timeSaved.toFixed(2)} min saved)</Text>
            <Text color="white">This month: {stats.thisMonth.count} ({stats.thisMonth.timeSaved.toFixed(2)} min saved)</Text>
            <br />
            <Text color="white" fontSize='lg'>Top repositories</Text>
            {
                topRepositories.length > 0 ? (
                    topRepositories.map(repo => 
                        <Text color="white" key={repo.repository}>{repo.repository}: {repo.count}</Text>
                    )
                ) : (
                    <Text color="white">N/A</Text>
                )
            }
        </ChakraProvider>
    );
};

export default App;