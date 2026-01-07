import { supabaseAdmin } from './config/supabase.js';

(async () => {
    try {
        console.log('🧹 Force cleaning stuck games...');

        // Get all games in IN_PROGRESS state
        const { data: stuckGames, error: findError } = await supabaseAdmin
            .from('games')
            .select('game_id, state, player1_address, player2_address')
            .eq('state', 1); // IN_PROGRESS

        if (findError) {
            console.error('❌ Error finding games:', findError);
            process.exit(1);
        }

        console.log(`Found ${stuckGames?.length || 0} stuck games`);

        if (stuckGames && stuckGames.length > 0) {
            console.log('Stuck games:', stuckGames);

            const gameIds = stuckGames.map(g => g.game_id);

            // Cancel all stuck games
            const { error: updateError } = await supabaseAdmin
                .from('games')
                .update({
                    state: 3, // CANCELLED
                    finished_at: new Date().toISOString()
                })
                .in('game_id', gameIds);

            if (updateError) {
                console.error('❌ Error cancelling games:', updateError);
                process.exit(1);
            }

            console.log(`✅ Successfully cancelled ${stuckGames.length} games:`, gameIds);
        } else {
            console.log('✅ No stuck games found!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
})();
