<?php
/**
 * This interface represents a publishing mechanism to publish build results
 * 
 * @package Xinc.Plugin
 * @author Arno Schneider
 * @version 2.0
 * @copyright 2007 Arno Schneider, Barcelona
 * @license  http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see license.php
 *    This file is part of Xinc.
 *    Xinc is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License as published
 *    by the Free Software Foundation; either version 2.1 of the License, or    
 *    (at your option) any later version.
 *
 *    Xinc is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with Xinc, write to the Free Software
 *    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
require_once 'Xinc/Plugin/Base.php';

require_once 'Xinc/Plugin/Repos/Schedule/Task.php';
require_once 'Xinc/Plugin/Repos/Cron/Task.php';

class Xinc_Plugin_Repos_Schedule extends Xinc_Plugin_Base
{
    public function validate()
    {
        return true;
    }
    /**
     * Returns the defined tasks of the plugin
     * @return Xinc_Plugin_Task[]
     */
    public function getTaskDefinitions()
    {
        return array(new Xinc_Plugin_Repos_Schedule_Task($this),
                     new Xinc_Plugin_Repos_Cron_Task($this));
    }
    


}