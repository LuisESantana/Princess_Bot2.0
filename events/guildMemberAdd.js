module.exports = member => {
  //const guild = member.guild;
  const members = client.channels.find('name', 'members');
  client.channels.get(members.id).send(`Please welcome ${member.user.username} to the server!`).catch(console.error)
};
