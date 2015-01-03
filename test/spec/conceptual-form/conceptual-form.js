it("should be able to play a Song", function() {
    player.play(song);
    expect(player.isPlaying).toBeTruthy();
});
