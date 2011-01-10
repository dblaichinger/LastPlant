# == Schema Information
# Schema version: 20110108170303
#
# Table name: maps
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  score      :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  content    :text
#

class Map < ActiveRecord::Base
    attr_accessible :name, :content, :score, :user_id
    
    belongs_to :user
end
