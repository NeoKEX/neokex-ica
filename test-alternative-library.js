import { IgApiClient } from 'instagram-private-api';
import { readFileSync } from 'fs';

async function testAlternativeLibrary() {
  console.log('🧪 Testing instagram-private-api library with cookies\n');
  
  try {
    const ig = new IgApiClient();
    
    console.log('📂 Reading cookies from cookies.txt...');
    const cookieContent = readFileSync('./cookies.txt', 'utf-8');
    const cookieLines = cookieContent.split('\n');
    
    const cookies = {};
    cookieLines.forEach((line, index) => {
      if (!line.trim() || line.startsWith('# ')) return;
      
      let cleanLine = line.replace(/^#HttpOnly_/, '');
      const parts = cleanLine.split(/\s+/);
      
      if (parts.length >= 7) {
        const name = parts[5];
        const value = parts[6];
        cookies[name] = value;
        console.log(`  Parsed cookie: ${name}=${value.substring(0, 20)}...`);
      }
    });
    
    console.log(`\nTotal cookies found: ${Object.keys(cookies).length}`);
    
    if (cookies.sessionid && cookies.ds_user_id) {
      console.log('✅ Required cookies found (sessionid, ds_user_id)\n');
      
      ig.state.generateDevice(cookies.ds_user_id);
      
      for (const [name, value] of Object.entries(cookies)) {
        await ig.state.cookieJar.setCookie(`${name}=${value}; Domain=.instagram.com; Path=/;`, 'https://instagram.com');
      }
      
      console.log('🔍 Testing authentication...');
      try {
        const user = await ig.account.currentUser();
        console.log(`✅ Authenticated as: ${user.username}`);
        console.log(`   User ID: ${user.pk}`);
        console.log(`   Full Name: ${user.full_name || 'N/A'}\n`);
        
        console.log('📨 Testing inbox access...');
        try {
          const inboxFeed = ig.feed.directInbox();
          const inbox = await inboxFeed.items();
          console.log(`✅ Inbox loaded: ${inbox.length} conversations\n`);
          
          if (inbox.length > 0) {
            console.log('   Recent conversations:');
            inbox.slice(0, 3).forEach((thread, i) => {
              const users = thread.users?.map(u => u.username).join(', ') || 'Unknown';
              console.log(`   ${i + 1}. ${users}`);
            });
            console.log('');
          }
          
          console.log('✅ instagram-private-api library works with your cookies and can access inbox!');
        } catch (inboxError) {
          console.log(`❌ Inbox access failed: ${inboxError.message}`);
          console.log('   But authentication was successful!\n');
        }
        
      } catch (authError) {
        console.log(`❌ Authentication failed: ${authError.message}`);
        console.log('   Your cookies may have expired or instagram-private-api needs different setup');
      }
      
    } else {
      console.log('❌ Missing required cookies (sessionid or ds_user_id)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

testAlternativeLibrary();
