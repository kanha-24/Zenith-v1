const { AttachmentBuilder, MessageFlags } = require('discord.js');

function isBlockedDmError(error) {
  return error?.code === 50007 ||
    error?.code === 50278 ||
    error?.code === 50013 ||
    /Cannot send messages to this user/i.test(error?.message || '');
}

async function sendDumpFile({ target, fallback, container, filePath, filename }) {
  const makePayload = () => ({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
    files: [new AttachmentBuilder(filePath, { name: filename })]
  });

  try {
    await target.send(makePayload());
    return true;
  } catch (error) {
    if (!isBlockedDmError(error)) {
      throw error;
    }

    const payload = makePayload();
    if (typeof fallback.editReply === 'function') {
      await fallback.editReply(payload);
    } else if (typeof fallback.edit === 'function') {
      await fallback.edit(payload);
    } else if (typeof fallback.reply === 'function') {
      await fallback.reply(payload);
    } else {
      throw error;
    }

    return false;
  }
}

module.exports = { sendDumpFile };
