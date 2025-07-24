// Test script to verify username assignment logic
const PREDEFINED_USERNAMES = ['Singh', 'Kaur'];
let connectedUsers = [];

function simulateUserConnection(socketId) {
    console.log(`\n--- User ${socketId} connecting ---`);
    console.log(`Current connected users: ${connectedUsers.length}`);
    
    // Add user to connected users with predefined names
    const userIndex = connectedUsers.length; // Get index before adding user
    const assignedUsername = PREDEFINED_USERNAMES[userIndex];
    console.log(`Assigning username: ${assignedUsername} to user ${socketId} (index: ${userIndex})`);
    
    connectedUsers.push({
        id: socketId,
        username: assignedUsername
    });
    
    console.log(`User added. Total users: ${connectedUsers.length}`);
    console.log(`Connected users:`, connectedUsers.map(u => `${u.id}: ${u.username}`));
    
    return {
        username: assignedUsername,
        userCount: connectedUsers.length
    };
}

// Test with two users
console.log('Testing username assignment...');
const user1 = simulateUserConnection('user1');
const user2 = simulateUserConnection('user2');

console.log('\n--- Final Results ---');
console.log('User 1:', user1);
console.log('User 2:', user2);
