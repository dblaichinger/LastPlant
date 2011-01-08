# == Schema Information
# Schema version: 20110106163234
#
# Table name: maps
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  content    :string(255)
#  score      :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#

class Map < ActiveRecord::Base
    attr_accessible :name, :content, :score, :user_id
    
    belongs_to :user
end
