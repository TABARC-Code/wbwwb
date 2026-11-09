# Prototype audio

The review branch supplies synthetic sirens, crowd textures, broadcast effects and seasonal jingles in WAV, MP3, M4A and Opus formats. These are test assets, not field recordings or recorded speech.

The standalone runtime does not load these additional clips. Its existing soundscape remains active. The prototype branch selected sports and adverts randomly, independently of the photographed story, and used wall-clock timers without complete scene disposal. Those hooks were not retained.

`scripts/generate-better-placeholder-audio.py` creates the WAV placeholders. The conversion and verification shell scripts require FFmpeg. Review volume, clipping, duration and licensing before replacing these with recordings or enabling them in play.
