# Submissions are pinned to a Form Version

Admins can edit a Form after Agents have submitted answers, so each Submission records the Form Version it was filled against, and the backend must keep every Form Version. The POC already increments `form.version` whenever the Form Schema changes; the backend contract must retain old versions rather than overwrite them.
