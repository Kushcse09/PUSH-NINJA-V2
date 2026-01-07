import { supabaseAdmin } from '../config/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🧹 Manual cleanup: Cancelling stuck games...');

        // Cancel all games in IN_PROGRESS state (state = 1)
        const { data: stuckGames, error: findError } = await supabaseAdmin
            .from('games')
            .select('game_id, state')
            .eq('state', 1);

        if (findError) {
            console.error('Error finding stuck games:', findError);
            return res.status(500).json({ error: 'Failed to find stuck games', details: findError });
        }

        if (stuckGames && stuckGames.length > 0) {
            const gameIds = stuckGames.map(g => g.game_id);

            const { error: updateError } = await supabaseAdmin
                .from('games')
                .update({
                    state: 3, // CANCELLED
                    finished_at: new Date().toISOString()
                })
                .in('game_id', gameIds);

            if (updateError) {
                console.error('Error cancelling stuck games:', updateError);
                return res.status(500).json({ error: 'Failed to cancel stuck games', details: updateError });
            }

            console.log(`🧹 Cancelled ${stuckGames.length} stuck games:`, gameIds);
            return res.status(200).json({
                success: true,
                message: `Cancelled ${stuckGames.length} stuck game(s)`,
                gameIds
            });
        }

        return res.status(200).json({ success: true, message: 'No stuck games found' });
    } catch (error) {
        console.error('Error in cleanup:', error);
        return res.status(500).json({ error: 'Cleanup failed', details: error.message });
    }
}
